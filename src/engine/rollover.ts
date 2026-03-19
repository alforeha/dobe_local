// ─────────────────────────────────────────
// ROLLOVER ENGINE — 9-STEP MIDNIGHT SEQUENCE
// Defined in storage schema §7 (D14).
//
// executeRollover() runs all 9 steps in order.
// Each step is a discrete named function.
// Rollover state tracked in useSystemStore (lastRollover, rolloverStep).
//
// Resumability: rolloverStep is written before each step begins and cleared
// (set to null) after step 9 completes. On boot, if rolloverStep is set,
// executeRollover() resumes from that step number.
//
// On app boot: if lastRollover < today, trigger rollover before hydrating UI.
// ─────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { PlannedEvent } from '../types/plannedEvent';
import type { Event, QuickActionsEvent } from '../types/event';
import type { Task } from '../types/task';
import type { Marker } from '../types/act';
import { useSystemStore } from '../stores/useSystemStore';
import { useUserStore } from '../stores/useUserStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useProgressionStore } from '../stores/useProgressionStore';
import { storageSet, storageKey } from '../storage';
import { materialisePlannedEvent } from './materialise';

// ── DATE HELPERS ──────────────────────────────────────────────────────────────

/** Returns today as YYYY-MM-DD */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns true if isoDate (YYYY-MM-DD) is on or before the cutoff date */
function isOnOrBefore(isoDate: string, cutoff: string): boolean {
  return isoDate <= cutoff;
}

// ── RECURRENCE RULE HELPERS ───────────────────────────────────────────────────

const WEEKDAY_MAP: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/**
 * Return true if a PlannedEvent is due on the given date.
 * Checks activeState, seedDate ≤ targetDate, dieDate not passed,
 * and recurrence pattern.
 */
function isPlannedEventDue(pe: PlannedEvent, targetDate: string): boolean {
  if (pe.activeState !== 'active') return false;
  if (pe.seedDate > targetDate) return false;
  if (pe.dieDate && pe.dieDate < targetDate) return false;

  const rule = pe.recurrenceInterval;
  const target = new Date(targetDate + 'T00:00:00');
  const seed   = new Date(pe.seedDate + 'T00:00:00');

  if (rule.endsOn && rule.endsOn < targetDate) return false;

  switch (rule.frequency) {
    case 'daily': {
      // every interval days from seedDate
      const diffDays = Math.round((target.getTime() - seed.getTime()) / 86_400_000);
      return diffDays >= 0 && diffDays % (rule.interval || 1) === 0;
    }
    case 'weekly': {
      const diffDays = Math.round((target.getTime() - seed.getTime()) / 86_400_000);
      const diffWeeks = Math.floor(diffDays / 7);
      if (diffWeeks % (rule.interval || 1) !== 0) return false;
      const dayName = Object.keys(WEEKDAY_MAP).find(
        (k) => WEEKDAY_MAP[k] === target.getDay(),
      )!;
      return rule.days.includes(dayName as import('../types/taskTemplate').Weekday);
    }
    case 'monthly': {
      // nth-weekday resolution: same day-of-week in same ordinal position as seedDate
      const seedDow  = seed.getDay();
      const targetDow = target.getDay();
      if (seedDow !== targetDow) return false;
      const seedNth  = Math.floor((seed.getDate() - 1) / 7);
      const targetNth = Math.floor((target.getDate() - 1) / 7);
      if (seedNth !== targetNth) return false;
      const monthDiff =
        (target.getFullYear() - seed.getFullYear()) * 12 +
        (target.getMonth() - seed.getMonth());
      return monthDiff >= 0 && monthDiff % (rule.interval || 1) === 0;
    }
    case 'custom':
      // custom conditions not evaluated here — caller handles or skips
      return false;
    default:
      return false;
  }
}

/**
 * Advance a PlannedEvent's seedDate to the next occurrence after the given date.
 * Returns the new seedDate string, or the existing seedDate if no future occurrence found.
 */
function computeNextSeedDate(pe: PlannedEvent, afterDate: string): string {
  const DAYS_LOOKAHEAD = 366;
  const start = new Date(afterDate + 'T00:00:00');
  for (let i = 1; i <= DAYS_LOOKAHEAD; i++) {
    const candidate = new Date(start.getTime() + i * 86_400_000);
    const candidateISO = candidate.toISOString().slice(0, 10);
    const candidatePe: PlannedEvent = { ...pe, seedDate: pe.seedDate }; // seedDate stays for nth-weekday reference
    if (isPlannedEventDue(candidatePe, candidateISO)) {
      return candidateISO;
    }
  }
  return pe.seedDate;
}

/**
 * Compute the next fire date for a Marker based on its recurrence interval.
 * Anchor is Marker.lastFired (or marker fires immediately if never fired).
 */
function computeMarkerNextFire(marker: Marker): string {
  if (!marker.lastFired) return todayISO();
  const anchor = new Date(marker.lastFired + 'T00:00:00');
  const rule = marker.interval;
  switch (rule.frequency) {
    case 'daily':
      anchor.setDate(anchor.getDate() + (rule.interval || 1));
      break;
    case 'weekly':
      anchor.setDate(anchor.getDate() + 7 * (rule.interval || 1));
      break;
    case 'monthly':
      anchor.setMonth(anchor.getMonth() + (rule.interval || 1));
      break;
    default:
      break;
  }
  return anchor.toISOString().slice(0, 10);
}

// ── STEP 1 — Identify due PlannedEvents ──────────────────────────────────────

function step1_identifyDuePlannedEvents(rolloverDate: string): PlannedEvent[] {
  const { plannedEvents } = useScheduleStore.getState();
  return Object.values(plannedEvents).filter((pe) =>
    isPlannedEventDue(pe, rolloverDate),
  );
}

// ── STEP 2 — Resolve conflicts ────────────────────────────────────────────────

/**
 * Applies conflictMode for each PE against all other PEs on the same day.
 * For MVP06: concurrent mode always passes; override drops earlier conflicts;
 * shift/truncate are noted but not fully time-shifted (BUILD-time detail).
 * Returns the surviving PE list.
 */
function step2_resolveConflicts(due: PlannedEvent[]): PlannedEvent[] {
  // Group by concurrent vs exclusive
  const concurrent = due.filter((pe) => pe.conflictMode === 'concurrent');
  const exclusive = due.filter((pe) => pe.conflictMode !== 'concurrent');

  // Sort exclusive by startTime — last one wins on strict 'override'
  const sorted = exclusive.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const resolved: PlannedEvent[] = [];
  for (const pe of sorted) {
    const conflicts = resolved.filter(
      (r) => r.startTime < pe.endTime && r.endTime > pe.startTime,
    );
    if (conflicts.length === 0) {
      resolved.push(pe);
    } else if (pe.conflictMode === 'override') {
      // Remove earlier conflicting entries and replace with this one
      for (const c of conflicts) {
        const idx = resolved.indexOf(c);
        if (idx !== -1) resolved.splice(idx, 1);
      }
      resolved.push(pe);
    } else {
      // shift / truncate — include both for MVP (BUILD-time full impl)
      resolved.push(pe);
    }
  }

  return [...resolved, ...concurrent];
}

// ── STEP 3 — Materialise PlannedEvents → Events ───────────────────────────────

function step3_materialisePlannedEvents(
  resolved: PlannedEvent[],
  rolloverDate: string,
): Event[] {
  const { taskTemplates } = useScheduleStore.getState();
  const events: Event[] = [];
  for (const pe of resolved) {
    const { event } = materialisePlannedEvent(pe, rolloverDate, taskTemplates);
    events.push(event);
  }
  return events;
}

// ── STEP 4 — Pull task lists (handled inside materialise, step recorded) ──────

/**
 * Step 4 is folded into materialisePlannedEvent (cursor advance + task creation).
 * This function is a no-op marker so the step index stays aligned.
 */
function step4_pullTaskLists(): void {
  // taskPoolCursor advance and task instantiation handled in step3 / materialise.ts
}

// ── STEP 5 — Evaluate Markers ─────────────────────────────────────────────────

interface DueMarker {
  marker: Marker;
  actId: string;
  chainIndex: number;
  questIndex: number;
  markerIndex: number;
}

function step5_evaluateMarkers(rolloverDate: string): DueMarker[] {
  const { acts } = useProgressionStore.getState();
  const due: DueMarker[] = [];

  for (const act of Object.values(acts)) {
    act.chains.forEach((chain, chainIndex) => {
      chain.quests.forEach((quest, questIndex) => {
        if (quest.completionState !== 'active') return;
        quest.timely.markers.forEach((marker, markerIndex) => {
          if (!marker.activeState) return;
          if (isOnOrBefore(marker.nextFire, rolloverDate)) {
            due.push({ marker, actId: act.id, chainIndex, questIndex, markerIndex });
          }
        });
      });
    });
  }

  return due;
}

// ── STEP 6 — Fire Markers → Tasks ────────────────────────────────────────────

function step6_fireMarkers(dueMarkers: DueMarker[]): void {
  if (dueMarkers.length === 0) return;

  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();
  const progressionStore = useProgressionStore.getState();

  for (const { marker, actId, chainIndex, questIndex, markerIndex } of dueMarkers) {
    // Instantiate a Task for the marker's taskTemplate
    const task: Task = {
      id: uuidv4(),
      templateRef: marker.taskTemplateRef,
      completionState: 'pending',
      completedAt: null,
      resultFields: {},
      attachmentRef: null,
      resourceRef: null,
      location: null,
      sharedWith: null,
    };

    scheduleStore.setTask(task);
    storageSet(storageKey.task(task.id), task);

    // Push task ref to user's gtdList
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
      storageSet('user', updatedUser);
    }

    // Update marker lastFired + nextFire on the Act
    const act = progressionStore.acts[actId];
    if (!act) continue;

    const updatedAct = {
      ...act,
      chains: act.chains.map((chain, ci) => {
        if (ci !== chainIndex) return chain;
        return {
          ...chain,
          quests: chain.quests.map((quest, qi) => {
            if (qi !== questIndex) return quest;
            const updatedMarkers = quest.timely.markers.map((m, mi) => {
              if (mi !== markerIndex) return m;
              const now = todayISO();
              return {
                ...m,
                lastFired: now,
                nextFire: computeMarkerNextFire({ ...m, lastFired: now }),
              };
            });
            return {
              ...quest,
              timely: { ...quest.timely, markers: updatedMarkers },
            };
          }),
        };
      }),
    };

    progressionStore.setAct(updatedAct);
    storageSet(storageKey.act(actId), updatedAct);
  }
}

// ── STEP 7 — Archive Events + move QuickActionsEvent ─────────────────────────

function step7_archiveEvents(): void {
  const scheduleStore = useScheduleStore.getState();
  const eventIds = Object.keys(scheduleStore.activeEvents);

  for (const eventId of eventIds) {
    scheduleStore.archiveEvent(eventId);
    // Remove active event key, write to history is handled by archiveEvent in store
    // For persistent history we need to keep the event — storageLayer key stays as event:{uuid}
    // QA events carry qa- prefix
    if (eventId.startsWith('qa-')) {
      // QuickActionsEvent archived — storage key stays for history reads
    }
  }
}

// ── STEP 8 — Update RecurrenceRules ──────────────────────────────────────────

function step8_updateRecurrence(resolved: PlannedEvent[], rolloverDate: string): void {
  const scheduleStore = useScheduleStore.getState();

  for (const pe of resolved) {
    if (pe.dieDate) continue; // one-off — no recurrence update needed

    const nextSeed = computeNextSeedDate(pe, rolloverDate);
    if (nextSeed !== pe.seedDate) {
      const updatedPe: PlannedEvent = { ...pe, seedDate: nextSeed };
      scheduleStore.setPlannedEvent(updatedPe);
      storageSet(storageKey.plannedEvent(updatedPe.id), updatedPe);
    }
  }
}

// ── STEP 9 — Coach review + new QuickActionsEvent ────────────────────────────

function step9_coachReview(newDate: string): void {
  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();

  // Create the new day's QuickActionsEvent
  const qaId = `qa-${newDate}`;
  const qa: QuickActionsEvent = {
    id: qaId,
    eventType: 'quickActions',
    date: newDate,
    completions: [],
    xpAwarded: 0,
    sharedCompletions: null,
  };

  scheduleStore.setActiveEvent(qa);
  storageSet(storageKey.quickActions(newDate), qa);

  // Push a rollover feed entry if user exists
  const user = userStore.user;
  if (user) {
    const feedEntry = {
      commentBlock: `Rollover complete for ${newDate}. Ready to go!`,
      sourceType: 'rollover',
      timestamp: new Date().toISOString(),
    };
    const updatedUser = {
      ...user,
      feed: {
        ...user.feed,
        entries: [feedEntry, ...user.feed.entries],
        unreadCount: user.feed.unreadCount + 1,
      },
    };
    userStore.setUser(updatedUser);
    storageSet('user', updatedUser);
  }
}

// ── EXECUTE ROLLOVER ──────────────────────────────────────────────────────────

/**
 * Run all 9 rollover steps in sequence.
 *
 * @param rolloverDate  The date being rolled over TO (new day, YYYY-MM-DD).
 *                      Defaults to today.
 * @param resumeFrom    Step number to resume from (1–9). Used on interrupted-boot recovery.
 */
export async function executeRollover(
  rolloverDate: string = todayISO(),
  resumeFrom = 1,
): Promise<void> {
  const systemStore = useSystemStore.getState();

  // Step 1 — identify due PlannedEvents
  let due: PlannedEvent[] = [];
  let resolved: PlannedEvent[] = [];

  if (resumeFrom <= 1) {
    systemStore.setRolloverStep(1);
    due = step1_identifyDuePlannedEvents(rolloverDate);
  }

  // Step 2 — resolve conflicts
  if (resumeFrom <= 2) {
    systemStore.setRolloverStep(2);
    // Re-load due list if resuming mid-run (edge case: use all active PEs as fallback)
    if (resumeFrom === 2) {
      due = step1_identifyDuePlannedEvents(rolloverDate);
    }
    resolved = step2_resolveConflicts(due);
  } else {
    // resuming at step 3+: re-derive to avoid stale closures
    due = step1_identifyDuePlannedEvents(rolloverDate);
    resolved = step2_resolveConflicts(due);
  }

  // Step 3 — materialise
  if (resumeFrom <= 3) {
    systemStore.setRolloverStep(3);
    step3_materialisePlannedEvents(resolved, rolloverDate);
  }

  // Step 4 — task lists (no-op, handled in materialise)
  if (resumeFrom <= 4) {
    systemStore.setRolloverStep(4);
    step4_pullTaskLists();
  }

  // Step 5 — evaluate markers
  let dueMarkers: DueMarker[] = [];
  if (resumeFrom <= 5) {
    systemStore.setRolloverStep(5);
    dueMarkers = step5_evaluateMarkers(rolloverDate);
  }

  // Step 6 — fire markers
  if (resumeFrom <= 6) {
    systemStore.setRolloverStep(6);
    if (resumeFrom === 6) {
      dueMarkers = step5_evaluateMarkers(rolloverDate);
    }
    step6_fireMarkers(dueMarkers);
  }

  // Step 7 — archive events
  if (resumeFrom <= 7) {
    systemStore.setRolloverStep(7);
    step7_archiveEvents();
  }

  // Step 8 — update recurrence
  if (resumeFrom <= 8) {
    systemStore.setRolloverStep(8);
    step8_updateRecurrence(resolved, rolloverDate);
  }

  // Step 9 — coach review + new QA event
  if (resumeFrom <= 9) {
    systemStore.setRolloverStep(9);
    step9_coachReview(rolloverDate);
  }

  // Mark rollover complete
  systemStore.setLastRollover(rolloverDate);
  systemStore.setRolloverStep(null);
}

// ── BOOT CHECK ────────────────────────────────────────────────────────────────

/**
 * Call this on app boot, before hydrating any UI.
 *
 * - If a rollover was interrupted (rolloverStep is set), resume it.
 * - If lastRollover < today, run a fresh rollover.
 * - Otherwise no-op.
 */
export async function checkAndRunRolloverOnBoot(): Promise<void> {
  const { lastRollover, rolloverStep } = useSystemStore.getState();
  const today = todayISO();

  if (rolloverStep !== null && rolloverStep >= 1) {
    // Interrupted rollover — resume from step that was in flight
    await executeRollover(today, rolloverStep);
    return;
  }

  if (!lastRollover || lastRollover < today) {
    await executeRollover(today, 1);
  }
}
