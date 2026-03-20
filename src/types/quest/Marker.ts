// ─────────────────────────────────────────
// Marker — virtual fire indicator for Quest check-ins
// Lives inside Quest.timely.markers[].
// D02: Two conditionTypes in LOCAL v1 — interval and xpThreshold.
//   taskCount deferred post LOCAL v1. Enum extensible.
// D03: One TaskTemplate per Quest, shared across all Milestone check-ins.
//   Marker holds taskTemplateRef — instantiated into a Task on each fire.
// ─────────────────────────────────────────

import type { RecurrenceRule } from '../taskTemplate';

/**
 * Determines which field drives Marker fire condition (D02).
 * interval  — fires on RecurrenceRule schedule anchored to lastFired.
 * xpThreshold — fires when the qualifying XP amount is reached.
 * Enum is extensible — taskCount deferred post LOCAL v1.
 */
export type MarkerConditionType = 'interval' | 'xpThreshold';

export interface Marker {
  /** Parent Quest id ref */
  questRef: string;
  /**
   * Determines fire condition (D02):
   *   interval      — uses interval field (RecurrenceRule)
   *   xpThreshold   — uses xpThreshold field (number)
   */
  conditionType: MarkerConditionType;
  /**
   * Recurrence schedule for firing.
   * Set when conditionType is interval; null when conditionType is xpThreshold.
   * Anchor is Marker.lastFired — same nth-weekday resolution as PlannedEvent (D37).
   */
  interval: RecurrenceRule | null;
  /**
   * XP interval that fires this Marker repeatedly (Q03 decision: since-last-fired).
   * Set when conditionType is xpThreshold; null when conditionType is interval.
   *
   * Behaves as a repeating XP interval — fires every N XP earned from task
   * completions since lastFired (or since Quest start if never fired).
   * Example: xpThreshold 1000 fires every time 1000 task-completion XP accumulates
   * since the previous fire. Does not count non-task XP sources.
   *
   * Implementation note (BUILD-time): the engine must snapshot total task XP at
   * each fire into a marker-level field (e.g. xpAtLastFire) to track the delta.
   */
  xpThreshold: number | null;
  /** Shared TaskTemplate id ref — one per Quest, instantiated into a Task on each fire (D03) */
  taskTemplateRef: string;
  /** ISO date — timestamp of last fire. null if this Marker has never fired. */
  lastFired: string | null;
  /**
   * Snapshot of User.progression.stats.xp at the time this Marker last fired.
   * Used to compute XP delta for xpThreshold condition evaluation (Q03).
   * null if never fired — engine uses 0 as baseline.
   */
  xpAtLastFire: number | null;
  /**
   * ISO date — next projected fire date.
   * Computed from lastFired + interval for interval markers.
   * null for xpThreshold markers (fire condition is XP-driven, not date-driven).
   * null for interval markers before first fire.
   */
  nextFire: string | null;
  /** true while Quest is active. Deactivated when Quest completes or pauses. */
  activeState: boolean;
}
