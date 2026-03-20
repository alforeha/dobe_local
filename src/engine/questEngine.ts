// ─────────────────────────────────────────
// QUEST ENGINE — condition evaluation, progress calculation, projectedFinish
//
// evaluateQuestSpecific() — routes to taskInput or resourceRef evaluation path (D01)
// evaluateMarkerCondition() — xpThreshold delta check only; interval handled by rollover
// deriveQuestProgress()    — returns 0–100 from measured value vs targetValue
// updateQuestProgress()    — persists progressPercent + projectedFinish to Quest
// computeProjectedFinish() — XP rate estimate per Q01 Option B (pending PM confirm)
// ─────────────────────────────────────────

import type { Quest } from '../types/act';
import type { Task } from '../types/task';
import type { Marker } from '../types/quest/Marker';
import type { RecurrenceRule } from '../types/taskTemplate';
import { useProgressionStore } from '../stores/useProgressionStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useResourceStore } from '../stores/useResourceStore';
import { useUserStore } from '../stores/useUserStore';
import { storageSet, storageKey } from '../storage';

// ── HELPERS ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Walk task.resultFields and return the first numeric value found.
 * Drills one level into nested objects (e.g. CounterInputFields, SetsRepsInputFields).
 * Returns null when no numeric value is present.
 */
function extractNumericFromResult(task: Task): number | null {
  for (const value of Object.values(task.resultFields)) {
    if (typeof value === 'number') return value;
    if (value !== null && typeof value === 'object') {
      for (const nested of Object.values(value as Record<string, unknown>)) {
        if (typeof nested === 'number') return nested;
      }
    }
  }
  return null;
}

/**
 * Estimate how many times a PlannedEvent fires per week from its RecurrenceRule.
 * Used by computeProjectedFinish to derive a daily XP rate.
 */
function estimateWeeklyFrequency(rule: RecurrenceRule): number {
  const n = rule.interval || 1;
  switch (rule.frequency) {
    case 'daily':   return 7 / n;
    case 'weekly':  return (rule.days.length || 1) / n;
    case 'monthly': return 1 / (n * 4.33);   // ~1/month ≈ 0.23/week per interval
    case 'custom':  return 0;
    default:        return 0;
  }
}

// ── EVALUATE QUEST SPECIFIC (D01) ─────────────────────────────────────────────

/**
 * Evaluate whether the Quest finish condition is met at Milestone completion.
 *
 * taskInput path  — extracts the first numeric value from completedTask.resultFields
 *                   and checks it against specific.targetValue.
 * resourceRef path — reads specific.resourceProperty from the Resource's meta object
 *                    (or root properties) and checks against specific.targetValue.
 *
 * Returns false when data is missing rather than throwing.
 */
export function evaluateQuestSpecific(quest: Quest, completedTask: Task): boolean {
  const { specific } = quest;

  if (specific.sourceType === 'taskInput') {
    const value = extractNumericFromResult(completedTask);
    if (value === null) return false;
    return value >= specific.targetValue;
  }

  if (
    specific.sourceType === 'resourceRef' &&
    specific.resourceRef !== null &&
    specific.resourceProperty !== null
  ) {
    const resource = useResourceStore.getState().resources[specific.resourceRef];
    if (!resource) return false;
    // Try meta first, then resource root
    const metaVal = (resource.meta as Record<string, unknown>)[specific.resourceProperty];
    if (typeof metaVal === 'number') return metaVal >= specific.targetValue;
    const rootVal = (resource as unknown as Record<string, unknown>)[specific.resourceProperty];
    if (typeof rootVal === 'number') return rootVal >= specific.targetValue;
  }

  return false;
}

// ── EVALUATE MARKER CONDITION ─────────────────────────────────────────────────

/**
 * Evaluate whether an xpThreshold Marker should fire.
 *
 * Interval markers are date-driven and evaluated by rollover step5 (nextFire check).
 * This function handles the xpThreshold conditionType only.
 *
 * Q03 decision: threshold is XP earned since lastFired (repeating interval).
 * xpAtLastFire snapshots User.stats.xp at each fire; delta is checked here.
 *
 * @param marker         The Marker to evaluate
 * @param currentUserXp  User.progression.stats.xp at evaluation time
 */
export function evaluateMarkerCondition(marker: Marker, currentUserXp: number): boolean {
  if (!marker.activeState) return false;
  if (marker.conditionType !== 'xpThreshold') return false;
  if (marker.xpThreshold === null) return false;
  const baseline = marker.xpAtLastFire ?? 0;
  return (currentUserXp - baseline) >= marker.xpThreshold;
}

// ── DERIVE QUEST PROGRESS ─────────────────────────────────────────────────────

/**
 * Derive progress percentage (0–100) for a Quest.
 *
 * taskInput path:
 *   Reads the last Milestone's resultFields to extract the latest measured value.
 *   Progress = (latestValue / targetValue) × 100.
 *   Falls back to (milestoneCount / targetValue) × 100 for non-numeric tasks.
 *
 * resourceRef path:
 *   Reads the current value of specific.resourceProperty on the linked Resource.
 *   Progress = (currentValue / targetValue) × 100.
 *
 * Returns 0 when no milestones exist or data is unavailable.
 */
export function deriveQuestProgress(quest: Quest): number {
  const { specific, milestones } = quest;
  if (specific.targetValue <= 0) return 0;

  if (specific.sourceType === 'taskInput') {
    if (milestones.length === 0) return 0;
    const latest = milestones[milestones.length - 1]!;
    // Attempt to extract a numeric value from milestone resultFields
    for (const value of Object.values(latest.resultFields)) {
      if (typeof value === 'number') {
        return Math.min(100, Math.round((value / specific.targetValue) * 100));
      }
    }
    // Fallback: count-based progress (e.g. "complete 12 sessions")
    return Math.min(100, Math.round((milestones.length / specific.targetValue) * 100));
  }

  if (
    specific.sourceType === 'resourceRef' &&
    specific.resourceRef !== null &&
    specific.resourceProperty !== null
  ) {
    const resource = useResourceStore.getState().resources[specific.resourceRef];
    if (!resource) return 0;
    const val = (resource.meta as Record<string, unknown>)[specific.resourceProperty];
    if (typeof val === 'number') {
      return Math.min(100, Math.round((val / specific.targetValue) * 100));
    }
  }

  return 0;
}

// ── COMPUTE PROJECTED FINISH ──────────────────────────────────────────────────

/**
 * Estimate next check-in date as a proxy for Quest.timely.projectedFinish.
 *
 * Q01 DECISION — Option B applied (pending PM confirmation):
 *   Only PlannedEvents whose taskList includes a TaskTemplate with taskType
 *   in Quest.measurable.taskTypes contribute to the XP rate estimate.
 *   To switch to Option A (all active PlannedEvents), remove the measurable
 *   taskType filter below.
 *
 * interval path:
 *   Returns the nextFire date of the first active Marker, or null.
 *   (The interval itself defines the cadence — no rate computation needed.)
 *
 * xpThreshold path:
 *   Computes daily XP rate from qualifying PlannedEvents in the schedule store.
 *   Estimates days until the threshold delta is met from current XP position.
 *   Returns null when no qualifying events are found in the store.
 *   Note: taskTemplates in the store are user custom only (D34). System
 *   templates from the Coach bundle are not visible here — the function will
 *   return null for quests that reference only system-provided task types.
 */
export function computeProjectedFinish(quest: Quest): string | null {
  if (quest.completionState !== 'active') return null;

  if (quest.timely.conditionType === 'interval') {
    const active = quest.timely.markers.find((m) => m.activeState && m.nextFire !== null);
    return active?.nextFire ?? null;
  }

  if (quest.timely.conditionType === 'xpThreshold') {
    const threshold = quest.timely.xpThreshold;
    if (!threshold) return null;

    const scheduleStore = useScheduleStore.getState();
    const user = useUserStore.getState().user;
    if (!user) return null;

    const measurableTypes = new Set(quest.measurable.taskTypes);

    // Option B: only PlannedEvents with qualifying task types
    let dailyXP = 0;
    for (const pe of Object.values(scheduleStore.plannedEvents)) {
      if (pe.activeState !== 'active') continue;

      const sessionXP = pe.taskList.reduce((sum, templateRef) => {
        const template = scheduleStore.taskTemplates[templateRef];
        if (!template || !measurableTypes.has(template.taskType)) return sum;
        return sum + Object.values(template.xpAward).reduce((s, v) => s + v, 0);
      }, 0);

      if (sessionXP === 0) continue;
      dailyXP += (sessionXP * estimateWeeklyFrequency(pe.recurrenceInterval)) / 7;
    }

    if (dailyXP <= 0) return null;

    // XP earned since last fire (Q03 since-last-fired model)
    const activeMarker = quest.timely.markers.find((m) => m.activeState);
    const xpBaseline = activeMarker?.xpAtLastFire ?? user.progression.stats.xp;
    const xpEarnedSinceLastFire = user.progression.stats.xp - xpBaseline;
    const xpRemaining = threshold - xpEarnedSinceLastFire;

    if (xpRemaining <= 0) return todayISO();

    const days = Math.ceil(xpRemaining / dailyXP);
    const target = new Date();
    target.setDate(target.getDate() + days);
    return target.toISOString().slice(0, 10);
  }

  return null;
}

// ── UPDATE QUEST PROGRESS ─────────────────────────────────────────────────────

/**
 * Recalculate and persist Quest.progressPercent and Quest.timely.projectedFinish.
 * Called after each Milestone completion by markerEngine.completeMilestone().
 *
 * @param actId        Act uuid
 * @param chainIndex   0-based index of the Chain within Act.chains[]
 * @param questIndex   0-based index of the Quest within Chain.quests[]
 */
export function updateQuestProgress(
  actId: string,
  chainIndex: number,
  questIndex: number,
): void {
  const progressionStore = useProgressionStore.getState();
  const act = progressionStore.acts[actId];
  if (!act) return;
  const chain = act.chains[chainIndex];
  if (!chain) return;
  const quest = chain.quests[questIndex];
  if (!quest) return;

  const progressPercent = deriveQuestProgress(quest);
  const projectedFinish = computeProjectedFinish(quest);

  const updatedAct = {
    ...act,
    chains: act.chains.map((c, ci) => {
      if (ci !== chainIndex) return c;
      return {
        ...c,
        quests: c.quests.map((q, qi) => {
          if (qi !== questIndex) return q;
          return {
            ...q,
            progressPercent,
            timely: { ...q.timely, projectedFinish },
          };
        }),
      };
    }),
  };

  progressionStore.setAct(updatedAct);
  storageSet(storageKey.act(actId), updatedAct);
}
