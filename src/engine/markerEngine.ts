// ─────────────────────────────────────────
// MARKER ENGINE — quest check-in event creation and milestone recording
//
// encodeQuestRef / decodeQuestRef — pipe-separated composite key for array-indexed navigation
// fireMarker()        — creates a check-in Task and snapshots marker state (D05)
// completeMilestone() — records the Milestone, evaluates finish condition, updates progress
// evaluatePlannedEventCreatedMarkers() — D80: fire markers triggered by plannedEvent.created
// ─────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { Marker } from '../types/quest/Marker';
import type { Milestone } from '../types/quest/Milestone';
import type { RecurrenceRule } from '../types/taskTemplate';
import type { Task } from '../types/task';
import type { GTDItem } from '../types/task';
import { useProgressionStore } from '../stores/useProgressionStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useUserStore } from '../stores/useUserStore';
import { evaluateQuestSpecific, updateQuestProgress, countTasksForScope } from './questEngine';
import { appendFeedEntry, FEED_SOURCE } from './feedEngine';
import { localISODate, getAppDate } from '../utils/dateUtils';
import {
  unlockAct,
  makeDailyChain,
  STARTER_ACT_IDS,
  STARTER_TEMPLATE_IDS,
  starterTaskTemplates,
} from '../coach/StarterQuestLibrary';
import { awardGold } from './awardPipeline';

// ── QUESTREF ENCODING ─────────────────────────────────────────────────────────

const QUEST_REF_SEP = '|';

/**
 * Encode a Quest's position in the hierarchy as a composite string ref.
 * Format: "${actId}|${chainIndex}|${questIndex}"
 *
 * actId is a UUID (hex/hyphen only) — no collision risk with QUEST_REF_SEP.
 * Indices are 0-based integers matching the array positions in Act.chains[].quests[].
 *
 * NOTE: questRef remains stable as long as chain/quest order is not mutated
 * while Tasks carrying this ref are still pending (D27).
 */
export function encodeQuestRef(actId: string, chainIndex: number, questIndex: number): string {
  return `${actId}${QUEST_REF_SEP}${chainIndex}${QUEST_REF_SEP}${questIndex}`;
}

/**
 * Decode a questRef string back into typed navigation components.
 * Returns null when the input is malformed or indices are non-numeric.
 */
export function decodeQuestRef(
  questRef: string,
): { actId: string; chainIndex: number; questIndex: number } | null {
  const parts = questRef.split(QUEST_REF_SEP);
  if (parts.length !== 3) return null;
  const [actId, ciStr, qiStr] = parts as [string, string, string];
  const chainIndex = parseInt(ciStr, 10);
  const questIndex = parseInt(qiStr, 10);
  if (Number.isNaN(chainIndex) || Number.isNaN(questIndex)) return null;
  return { actId, chainIndex, questIndex };
}

// ── COMPUTE NEXT FIRE DATE ────────────────────────────────────────────────────

/**
 * Advance a Marker's fire date from its lastFired date using the interval RecurrenceRule.
 * Returns todayISO() when the Marker has no interval (xpThreshold markers).
 * Used inside fireMarker to update marker.nextFire after each fire.
 */
function computeMarkerNextFire(marker: Marker): string {
  const today = getAppDate();
  if (!marker.lastFired) return today;
  const rule = marker.interval;
  if (!rule) return today; // xpThreshold marker — no calendar anchor
  const anchor = new Date(marker.lastFired + 'T00:00:00');
  switch ((rule as RecurrenceRule).frequency) {
    case 'daily':
      anchor.setDate(anchor.getDate() + (rule.interval || 1));
      break;
    case 'weekly':
      anchor.setDate(anchor.getDate() + 7 * (rule.interval || 1));
      break;
    case 'monthly':
      anchor.setMonth(anchor.getMonth() + (rule.interval || 1));
      if (rule.monthlyDay) {
        const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
        anchor.setDate(Math.min(rule.monthlyDay, lastDay));
      }
      break;
    default:
      break;
  }
  return localISODate(anchor);
}

function utcDateStringToLocalIso(utcDate: string): string {
  const d = new Date(utcDate + 'T00:00:00Z');
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function findQuickActionCompletionForDate(templateRef: string, dateIso: string): { task: Task; completedAt: string } | null {
  const scheduleStore = useScheduleStore.getState();
  for (const source of [scheduleStore.activeEvents, scheduleStore.historyEvents]) {
    for (const event of Object.values(source)) {
      if (!('eventType' in event) || event.eventType !== 'quickActions') continue;
      const quickActions = event as import('../types/event').QuickActionsEvent;
      if (
        quickActions.date !== dateIso &&
        quickActions.id !== `qa-${dateIso}` &&
        utcDateStringToLocalIso(quickActions.date) !== dateIso
      ) {
        continue;
      }
      for (const completion of quickActions.completions) {
        const task = scheduleStore.tasks[completion.taskRef];
        if (!task) continue;
        if (task.completionState !== 'complete') continue;
        if (task.templateRef !== templateRef) continue;
        return { task, completedAt: completion.completedAt };
      }
    }
  }
  return null;
}

// ── FIRE MARKER ───────────────────────────────────────────────────────────────

export interface FireMarkerParams {
  marker: Marker;
  markerIndex: number;
  questIndex: number;
  chainIndex: number;
  actId: string;
}

export function fireInitialIntervalMarkers(actId: string, chainIndex: number): void {
  const act = useProgressionStore.getState().acts[actId];
  const chain = act?.chains[chainIndex];
  if (!chain) return;

  chain.quests.forEach((quest, questIndex) => {
    if (quest.completionState !== 'active') return;
    const markerIndex = quest.timely.markers.findIndex(
      (m) => m.activeState && m.conditionType === 'interval' && m.nextFire === null,
    );
    if (markerIndex === -1) return;
    const marker = quest.timely.markers[markerIndex];
    if (!marker) return;
    fireMarker({ marker, markerIndex, questIndex, chainIndex, actId });
  });
}

/**
 * Fire a Marker: create a check-in Task and enqueue it in User.lists.gtdList.
 *
 * Steps performed:
 *   1. Look up Quest to resolve resource context for the Task
 *   2. Create a Task with questRef + actRef set for Milestone routing
 *   3. Persist Task to scheduleStore + storage
 *   4. Push Task ref to User.lists.gtdList
 *   5. Snapshot xpAtLastFire + taskCountAtLastFire + update marker state (lastFired, nextFire)
 *   6. Execute sideEffects[] — gtdWrite pushes a GTDItem to manualGtdList (D81)
 *   7. Persist Act to progressionStore + storage
 *
 * @param params  FireMarkerParams — marker + index triple + actId
 */
export function fireMarker(params: FireMarkerParams): void {
  const { marker, markerIndex, questIndex, chainIndex, actId } = params;

  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();
  const progressionStore = useProgressionStore.getState();
  const now = getAppDate();

  // Resolve the Quest to determine resource context
  const act = progressionStore.acts[actId];
  const quest = act?.chains[chainIndex]?.quests[questIndex];
  const resourceRef =
    quest?.specific.sourceType === 'resourceRef' ? (quest.specific.resourceRef ?? null) : null;

  // Build check-in Task — questRef enables completeMilestone to route back here
  const questRef = encodeQuestRef(actId, chainIndex, questIndex);
  const task: Task = {
    id: uuidv4(),
    templateRef: marker.taskTemplateRef,
    completionState: 'pending',
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef,
    location: null,
    sharedWith: null,
    questRef,
    actRef: actId,
    secondaryTag: null,
  };

  const existingQuickActionCompletion =
    marker.taskTemplateRef === STARTER_TEMPLATE_IDS.roll
      ? findQuickActionCompletionForDate(STARTER_TEMPLATE_IDS.roll, now)
      : null;

  if (existingQuickActionCompletion) {
    const currentXp = userStore.user?.progression.stats.xp ?? 0;
    const currentTaskCount =
      marker.conditionType === 'taskCount' ? countTasksForScope(marker) : null;
    const updatedAct = act
      ? {
          ...act,
          chains: act.chains.map((chain, ci) => {
            if (ci !== chainIndex) return chain;
            return {
              ...chain,
              quests: chain.quests.map((q, qi) => {
                if (qi !== questIndex) return q;
                const updatedMarkers = q.timely.markers.map((m, mi) => {
                  if (mi !== markerIndex) return m;
                  return {
                    ...m,
                    lastFired: now,
                    xpAtLastFire: m.conditionType === 'xpThreshold' ? currentXp : null,
                    taskCountAtLastFire: m.conditionType === 'taskCount' ? currentTaskCount : null,
                    nextFire: m.conditionType === 'interval'
                      ? computeMarkerNextFire({ ...m, lastFired: now })
                      : null,
                  };
                });
                return { ...q, timely: { ...q.timely, markers: updatedMarkers } };
              }),
            };
          }),
        }
      : null;
    if (updatedAct) {
      progressionStore.setAct(updatedAct);
    }
    const completedTask: Task = {
      ...task,
      completionState: 'complete',
      completedAt: existingQuickActionCompletion.completedAt,
      resultFields: existingQuickActionCompletion.task.resultFields,
    };
    scheduleStore.setTask(completedTask);
    completeMilestone(completedTask);
    return;
  }

  scheduleStore.setTask(task);

  // Enqueue in gtdList so the task surfaces for the user (D05)
  const user = userStore.user;
  if (user) {
    const updatedUser = {
      ...user,
      lists: {
        ...user.lists,
        gtdList: [...user.lists.gtdList, task.id],
      },
    };
    userStore.setUser(updatedUser);
  }

  // Feed entry for marker fire
  const markerFeedUser = useUserStore.getState().user;
  if (markerFeedUser) {
    appendFeedEntry({
      commentBlock: `Quest check-in ready`,
      sourceType: FEED_SOURCE.MARKER_FIRE,
      timestamp: new Date().toISOString(),
      triggerRef: task.id,
    }, markerFeedUser);
  }

  // Execute sideEffects[] (D81)
  const sideEffectUser = useUserStore.getState().user;
  if (sideEffectUser && marker.sideEffects) {
    let sideEffectUserMut = sideEffectUser;
    for (const effect of marker.sideEffects) {
      if (effect.type === 'gtdWrite') {
        const gtdItem: GTDItem = {
          id: uuidv4(),
          title: effect.note ?? 'Quest task',
          note: effect.note ?? null,
          resourceRef: null,
          dueDate: null,
          isManual: true,
          completionState: 'pending',
          completedAt: null,
          skipQAWrite: true,
        };
        sideEffectUserMut = {
          ...sideEffectUserMut,
          lists: {
            ...sideEffectUserMut.lists,
            manualGtdList: [...sideEffectUserMut.lists.manualGtdList, gtdItem],
          },
        };
      }
    }
    userStore.setUser(sideEffectUserMut);
  }

  if (!act) return;

  // Snapshot current XP for delta computation (Q03 since-last-fired model)
  const currentXp = userStore.user?.progression.stats.xp ?? 0;
  // Snapshot task count for taskCount markers to prevent re-fire at same threshold
  const currentTaskCount =
    marker.conditionType === 'taskCount' ? countTasksForScope(marker) : null;
  const updatedAt = now;

  const updatedAct = {
    ...act,
    chains: act.chains.map((chain, ci) => {
      if (ci !== chainIndex) return chain;
      return {
        ...chain,
        quests: chain.quests.map((q, qi) => {
          if (qi !== questIndex) return q;
          const updatedMarkers = q.timely.markers.map((m, mi) => {
            if (mi !== markerIndex) return m;
            const fired: Marker = {
              ...m,
              lastFired: updatedAt,
              xpAtLastFire: m.conditionType === 'xpThreshold' ? currentXp : null,
              taskCountAtLastFire: m.conditionType === 'taskCount' ? currentTaskCount : null,
              nextFire: m.conditionType === 'interval'
                ? computeMarkerNextFire({ ...m, lastFired: updatedAt })
                : null,
            };
            return fired;
          });
          return { ...q, timely: { ...q.timely, markers: updatedMarkers } };
        }),
      };
    }),
  };

  progressionStore.setAct(updatedAct);
}

// ── PLANNED EVENT CREATED TRIGGER (D80) ──────────────────────────────────────

/**
 * Evaluate and fire any Markers with triggerSource 'plannedEvent.created'.
 * Called by useScheduleStore.setPlannedEvent() when a new event is created.
 *
 * Only fires Markers where:
 *   - conditionType is taskCount
 *   - triggerSource is 'plannedEvent.created'
 *   - the system event count (number of PlannedEvents created) meets threshold
 */
export function evaluatePlannedEventCreatedMarkers(): void {
  const { acts } = useProgressionStore.getState();
  const { plannedEvents } = useScheduleStore.getState();
  const plannedEventCount = Object.keys(plannedEvents).length;

  for (const act of Object.values(acts)) {
    act.chains.forEach((chain, chainIndex) => {
      chain.quests.forEach((quest, questIndex) => {
        if (quest.completionState !== 'active') return;
        quest.timely.markers.forEach((marker, markerIndex) => {
          if (!marker.activeState) return;
          if ((marker.triggerSource ?? 'rollover') !== 'plannedEvent.created') return;
          if (marker.conditionType !== 'taskCount') return;
          if (marker.threshold === null) return;
          const countAtLastFire = marker.taskCountAtLastFire ?? 0;
          if (plannedEventCount <= countAtLastFire) return;
          if (plannedEventCount >= marker.threshold) {
            fireMarker({ marker, markerIndex, questIndex, chainIndex, actId: act.id });
          }
        });
      });
    });
  }
}

// ── COMPLETE MILESTONE ────────────────────────────────────────────────────────

/**
 * Record a completed quest check-in Task as a Milestone and evaluate Quest finish.
 *
 * Called by eventExecution.completeTask() when updatedTask.questRef is set.
 * The questRef on the task was stamped by fireMarker at creation time (D04).
 *
 * Steps performed:
 *   1. Decode questRef → actId / chainIndex / questIndex
 *   2. Look up the Quest (bail with warning if not found)
 *   3. Capture milestone from task.resultFields + full TaskTemplate shape
 *   4. Evaluate Quest finish condition via evaluateQuestSpecific()
 *   5a. If complete → set Quest.completionState = 'complete', deactivate all markers
 *   5b. If not complete → call updateQuestProgress() (derives progress + projectedFinish)
 *   6. Persist updated Act to store + storage
 *
 * @param completedTask  The Task that was just completed (completionState must be 'complete')
 */
export function completeMilestone(completedTask: Task): void {
  if (!completedTask.questRef) return;

  const parsed = decodeQuestRef(completedTask.questRef);
  if (!parsed) {
    console.warn(
      `[markerEngine] completeMilestone: malformed questRef "${completedTask.questRef}"`,
    );
    return;
  }
  const { actId, chainIndex, questIndex } = parsed;

  const progressionStore = useProgressionStore.getState();
  const scheduleStore = useScheduleStore.getState();

  const act = progressionStore.acts[actId];
  if (!act) {
    console.warn(`[markerEngine] completeMilestone: Act "${actId}" not found`);
    return;
  }
  const chain = act.chains[chainIndex];
  if (!chain) {
    console.warn(`[markerEngine] completeMilestone: chain[${chainIndex}] not found`);
    return;
  }
  const quest = chain.quests[questIndex];
  if (!quest) {
    console.warn(`[markerEngine] completeMilestone: quest[${questIndex}] not found`);
    return;
  }
  if (quest.completionState !== 'active') return;

  // Resolve TaskTemplate shape — stored inline in Milestone for immutability (D03).
  // System templates are not written to the store; fall back to the coach bundle.
  const template =
    scheduleStore.taskTemplates[completedTask.templateRef] ??
    starterTaskTemplates.find((t) => t.id === completedTask.templateRef) ??
    null;
  if (!template) {
    console.warn(
      `[markerEngine] completeMilestone: TaskTemplate "${completedTask.templateRef}" not found in store or coach bundle. Skipping Milestone.`,
    );
    return;
  }

  const milestone: Milestone = {
    questRef: completedTask.questRef,
    actRef: actId,
    resourceRef: quest.specific.sourceType === 'resourceRef'
      ? (quest.specific.resourceRef ?? null)
      : null,
    taskTemplateShape: template,
    completedAt: completedTask.completedAt ?? new Date().toISOString(),
    resultFields: completedTask.resultFields,
  };

  const isFinished = evaluateQuestSpecific(quest, completedTask);

  const updatedAct = {
    ...act,
    chains: act.chains.map((c, ci) => {
      if (ci !== chainIndex) return c;
      return {
        ...c,
        quests: c.quests.map((q, qi) => {
          if (qi !== questIndex) return q;
          const withMilestone = {
            ...q,
            milestones: [...q.milestones, milestone],
            progressPercent: isFinished ? 100 : q.progressPercent,
            completionState: isFinished
              ? ('complete' as const)
              : (q.completionState as typeof q.completionState),
            timely: isFinished
              ? {
                  ...q.timely,
                  // Deactivate all markers on completion
                  markers: q.timely.markers.map((m) => ({ ...m, activeState: false })),
                }
              : q.timely,
          };
          return withMilestone;
        }),
      };
    }),
  };

  progressionStore.setAct(updatedAct);

  // Derive and persist progressPercent + projectedFinish unless just completed
  if (!isFinished) {
    updateQuestProgress(actId, chainIndex, questIndex);
    return;
  }

  const userForQuestGold = useUserStore.getState().user;
  if (userForQuestGold) {
    useUserStore.getState().setUser(awardGold(1, userForQuestGold, {
      source: `quest.complete:${quest.name}`,
      suppressLog: true,
    }));
  }

  // Quest just completed — fire the next quest's interval marker immediately so
  // the user can act on Quest N+1 without waiting for the next rollover (FIX-13).
  // Only fires if the next quest exists, is active, and its first interval marker
  // has not yet been initialised (nextFire === null).
  const nextQuestIndex = questIndex + 1;
  const freshActForNext = useProgressionStore.getState().acts[actId];
  const nextQuest = freshActForNext?.chains[chainIndex]?.quests[nextQuestIndex];
  if (nextQuest && nextQuest.completionState === 'active') {
    const nextMarkerIdx = nextQuest.timely.markers.findIndex(
      (m) => m.activeState && m.conditionType === 'interval' && m.nextFire === null,
    );
    if (nextMarkerIdx !== -1) {
      const nextMarker = nextQuest.timely.markers[nextMarkerIdx]!;
      console.log(
        `[completeMilestone] Quest "${quest.name}" complete → firing next quest marker ` +
        `(questIdx=${nextQuestIndex} markerIdx=${nextMarkerIdx} template=${nextMarker.taskTemplateRef})`,
      );
      fireMarker({
        marker: nextMarker,
        markerIndex: nextMarkerIdx,
        questIndex: nextQuestIndex,
        chainIndex,
        actId,
      });
    }
  }

  // Quest just completed — propagate completion up to chain and act (D87)
  const completedChain = updatedAct.chains[chainIndex];
  if (!completedChain) return;

  const chainNowComplete = completedChain.quests.every(
    (q) => q.completionState === 'complete',
  );
  if (!chainNowComplete) return;

  // All quests in chain done — mark chain complete
  let propagatedAct = {
    ...updatedAct,
    chains: updatedAct.chains.map((c, ci) =>
      ci === chainIndex ? { ...c, completionState: 'complete' as const } : c,
    ),
  };

  // If every chain is complete, mark act complete
  const actNowComplete = propagatedAct.chains.every(
    (c) => c.completionState === 'complete',
  );
  if (actNowComplete) {
    propagatedAct = { ...propagatedAct, completionState: 'complete' as const };
  }

  progressionStore.setAct(propagatedAct);

  // D98 — +10 gold bonus for completing the Onboarding Act
  if (actNowComplete && actId === STARTER_ACT_IDS.onboarding) {
    const userForGold = useUserStore.getState().user;
    if (userForGold) {
      console.log('[reward.act-complete]', {
        actId,
        actName: propagatedAct.name,
        goldAward: 10,
        source: 'act.complete:onboarding',
        oldGold: userForGold.progression.gold ?? 0,
        newGold: (userForGold.progression.gold ?? 0) + 10,
        userId: userForGold.system.id,
      });
      useUserStore.getState().setUser(awardGold(10, userForGold, 'act.complete:onboarding'));
    }
  }

  // D79 — Unlock Daily Adventure when Onboarding Act completes
  if (actNowComplete && actId === STARTER_ACT_IDS.onboarding) {
    unlockAct(STARTER_ACT_IDS.daily);
    const freshStore = useProgressionStore.getState();
    const unlockedDaily = freshStore.acts[STARTER_ACT_IDS.daily];
    if (unlockedDaily) {
      const today = getAppDate();
      const chain1 = makeDailyChain(STARTER_ACT_IDS.daily, 1, today);
      const dailyWithChain = { ...unlockedDaily, chains: [chain1] };
      freshStore.setAct(dailyWithChain);
      fireInitialIntervalMarkers(STARTER_ACT_IDS.daily, 0);
    }
  }
}
