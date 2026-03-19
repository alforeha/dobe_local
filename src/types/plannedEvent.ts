// ─────────────────────────────────────────
// PLANNED EVENT — TASK / SCHEDULE CLUSTER
// Self-contained schedule and task pool.
// Materialises into Events via midnight rollover (D14).
// Serves as both planned event and routine (D36).
// Same-day creation triggers immediate materialisation.
// ─────────────────────────────────────────

import type { RecurrenceRule } from './taskTemplate';

// ── EVENT LOCATION ────────────────────────────────────────────────────────────

export interface EventLocation {
  latitude: number;
  longitude: number;
  placeName?: string;
}

// ── CONFLICT MODE (D08) ───────────────────────────────────────────────────────

export type ConflictMode = 'override' | 'shift' | 'truncate' | 'concurrent';

// ── ACTIVE STATE ──────────────────────────────────────────────────────────────

export type PlannedEventActiveState = 'active' | 'sleep';

/** [MULTI-USER] stub — null in LOCAL */
export type PlannedEventSharedWithStub = null;

/** [APP-STORE] stub — null in LOCAL */
export type PushReminderStub = null;

// ── PLANNED EVENT ROOT ────────────────────────────────────────────────────────

export interface PlannedEvent {
  /** uuid */
  id: string;
  name: string;
  description: string;
  /** Ref to icon asset */
  icon: string;
  color: string;
  /**
   * First occurrence — serves as RecurrenceRule anchor
   * for nth-weekday monthly resolution (D37).
   */
  seedDate: string; // ISO date
  /** Optional end date for multi-day or one-off events */
  dieDate: string | null; // ISO date
  /** RecurrenceRule ref (D37) — seedDate is the anchor */
  recurrenceInterval: RecurrenceRule;
  activeState: PlannedEventActiveState;
  /** D07 — full set of interchangeable TaskTemplate refs */
  taskPool: string[];
  /**
   * Current rotation pulled from pool.
   * Index into taskPool[] — advances and wraps at pool end (D47).
   */
  taskPoolCursor: number;
  /** Current rotation pulled from pool — snapshot of templateRefs for the materialised day */
  taskList: string[];
  /** D08 — schedule conflict resolution mode */
  conflictMode: ConflictMode;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  location: EventLocation | null;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedWith: PlannedEventSharedWithStub;
  /** [APP-STORE] stub — null in LOCAL */
  pushReminder: PushReminderStub;
}
