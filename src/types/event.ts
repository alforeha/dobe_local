// ─────────────────────────────────────────
// EVENT — TASK / SCHEDULE CLUSTER
// Concrete execution record materialised from PlannedEvent.
// System log per D02 and D03.
// User can convert any past Event with location to an Experience post.
//
// Also contains: QuickActionsEvent (D12, D44).
// ─────────────────────────────────────────

import type { EventLocation } from './plannedEvent';

// ── EVENT TYPE DISCRIMINATOR (D44) ────────────────────────────────────────────

export type EventType = 'standard' | 'quickActions' | 'planned';

// ── EVENT COMPLETION STATE ────────────────────────────────────────────────────

export type EventCompletionState = 'pending' | 'complete' | 'skipped';

// ── STUBS ─────────────────────────────────────────────────────────────────────

/** [MULTI-USER] stub — null in LOCAL */
export type EventSharedWithStub = null;

/** [MULTI-USER] stub — null in LOCAL */
export type CoAttendeesStub = null;

// ── EVENT ROOT ────────────────────────────────────────────────────────────────

export interface Event {
  /** uuid */
  id: string;
  /** Discriminator for UI rendering and history filtering (D44) */
  eventType: EventType;
  /** Optional — null for manually created events */
  plannedEventRef: string | null;
  name: string;
  startDate: string; // ISO date
  startTime: string; // HH:MM
  /** For multi-day events */
  endDate: string;   // ISO date
  endTime: string;   // HH:MM
  /** Task instance refs */
  tasks: string[];
  completionState: EventCompletionState;
  /** Sum of completed task XP */
  xpAwarded: number;
  /** Attachment refs — max 5, max 200 KB each (D09) */
  attachments: string[];
  location: EventLocation | null;
  note: string | null;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedWith: EventSharedWithStub;
  /** [MULTI-USER] stub — null in LOCAL */
  coAttendees: CoAttendeesStub;
}

// ── QUICK ACTIONS EVENT (D12, D44) ───────────────────────────────────────────
// Daily singleton receiving quick-fire completions.
// Date-keyed in localStorage as qa:{YYYY-MM-DD}.
// Lives in User.events.active[] during the day, moves to history[] at midnight rollover.

export interface QuickActionsCompletion {
  /** Task ref */
  taskRef: string;
  completedAt: string; // ISO date
}

/** [MULTI-USER] stub — null in LOCAL */
export type SharedCompletionsStub = null;

export interface QuickActionsEvent {
  /** qa-{YYYY-MM-DD} — date-keyed singleton (D12) */
  id: string;
  /** Always 'quickActions' — matches Event.eventType discriminator (D44) */
  eventType: 'quickActions';
  date: string; // ISO date
  /** Each: Task ref + completedAt timestamp. User-editable and deletable. Awards +2 agility (D39) */
  completions: QuickActionsCompletion[];
  /** Running daily total */
  xpAwarded: number;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedCompletions: SharedCompletionsStub;
}
