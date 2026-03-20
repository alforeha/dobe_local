// ─────────────────────────────────────────
// TASK — TASK / SCHEDULE CLUSTER
// Live instance of a TaskTemplate.
// Execution unit. Lives in User.lists.gtdList[] or inside an Event.
// UUID needed for undo and quest logging.
// ─────────────────────────────────────────

import type { InputFields } from './taskTemplate';

// ── LOCATION ─────────────────────────────────────────────────────────────────

export interface TaskLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  placeName?: string;
}

/** [MULTI-USER] stub — null in LOCAL */
export type SharedWithStub = null;

// ── TASK ROOT ─────────────────────────────────────────────────────────────────

export type TaskCompletionState = 'pending' | 'complete' | 'skipped';

export interface Task {
  /** uuid */
  id: string;
  /** Ref to originating TaskTemplate */
  templateRef: string;
  completionState: TaskCompletionState;
  completedAt: string | null; // ISO date
  /** Recorded values matching inputFields shape of TaskTemplate (D41) */
  resultFields: Partial<InputFields>;
  /** Optional Attachment ref — user evidence on completion */
  attachmentRef: string | null;
  /**
   * Optional ref to Resource that contextualised completion.
   * Enables +2 defense bonus routing and links task history back to resource log (D40).
   */
  resourceRef: string | null;
  /** Optional coordinates recorded during completion */
  location: TaskLocation | null;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedWith: SharedWithStub;
  /**
   * Encoded quest navigation path: "${actId}|${chainIndex}|${questIndex}".
   * Set by markerEngine.fireMarker() when this Task is a quest milestone check-in.
   * null for regular schedule tasks.
   */
  questRef: string | null;
  /**
   * Act uuid — mirrors the actId encoded in questRef for explicit cross-reference.
   * null for regular schedule tasks.
   */
  actRef: string | null;
}
