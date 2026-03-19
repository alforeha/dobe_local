// ─────────────────────────────────────────
// ACT — CORE
// Top of the 4-level quest hierarchy: Act → Chain → Quest → Milestone.
// Only Act has a uuid — Chain, Quest, Milestone are array-indexed (D27).
// Contains nested Chain, Quest, Milestone, and Marker types.
// ─────────────────────────────────────────

import type { RecurrenceRule } from './taskTemplate';

// ── MARKER (lives inside Quest.timely) ────────────────────────────────────────

export interface Marker {
  /** Parent Quest ref */
  questRef: string;
  /** Recurrence shape (D37) — anchor is Marker.lastFired */
  interval: RecurrenceRule;
  /** Milestone TaskTemplate ref — instantiated when Marker fires */
  taskTemplateRef: string;
  /** Timestamp of last fire — serves as RecurrenceRule anchor */
  lastFired: string | null; // ISO date
  /** Computed from lastFired and interval */
  nextFire: string; // ISO date
  /** Fires for life of Quest unless Quest completes or is paused */
  activeState: boolean;
}

// ── MILESTONE (array-indexed within Quest) ────────────────────────────────────

export interface Milestone {
  /** Parent Quest ref */
  questRef: string;
  /**
   * Inherits full TaskTemplate property shape — BUILD-time task.
   * Stored inline as a partial record here.
   */
  taskTemplateShape: Record<string, unknown>;
}

// ── QUEST (SMARTER framework — array-indexed within Chain) ───────────────────

export type QuestCompletionState = 'active' | 'complete' | 'failed';

export interface Quest {
  name: string;
  description: string;
  /** Ref to icon asset */
  icon: string;
  completionState: QuestCompletionState;
  /** SMARTER — target count, end state, or resource value */
  specific: Record<string, unknown>;
  /** SMARTER — relevant task types that apply progress */
  measurable: Record<string, unknown>;
  /** SMARTER — prereq quests, 91-day feasibility check */
  attainable: Record<string, unknown>;
  /** SMARTER — stat group, resource, or custom tag */
  relevant: Record<string, unknown>;
  /** SMARTER — Marker generation rules. Marker objects live here */
  timely: {
    markers: Marker[];
    [key: string]: unknown;
  };
  /** SMARTER — how missed Markers are handled (BUILD-time task) */
  exigency: Record<string, unknown>;
  /** SMARTER — reward grant and completion state handler */
  result: Record<string, unknown>;
  /** Logged Milestone results — array-indexed */
  milestones: Milestone[];
  /** XP or item ref — granted on quest completion */
  questReward: string;
}

// ── CHAIN (WOOP framework — array-indexed within Act) ────────────────────────

export type ChainCompletionState = 'active' | 'complete';

export interface Chain {
  name: string;
  description: string;
  /** Ref to icon asset */
  icon: string;
  /** WOOP — exaggerated intention */
  wish: string;
  /** WOOP — mental imagery */
  outcome: string;
  /** WOOP — blocker identification */
  obstacle: string;
  /** WOOP — stages Quests, feeds SMARTER fields */
  plan: Record<string, unknown>;
  /** XP or item ref — granted on completion */
  chainReward: string;
  /** Array of Quest objects — array-indexed (D27) */
  quests: Quest[];
  /** Cached derived state */
  completionState: ChainCompletionState;
}

// ── ACT ROOT ──────────────────────────────────────────────────────────────────

export type ActCompletionState = 'active' | 'complete';

/** [MULTI-USER] stub — null in LOCAL */
export type AccountabilityStub = null;

/** [MULTI-USER] stub — null in LOCAL */
export type SharedContactsStub = null;

export interface Act {
  /** uuid — only Act gets a uuid in the quest hierarchy (D27) */
  id: string;
  name: string;
  description: string;
  /** Ref to icon asset */
  icon: string;
  /** user ref | coach ref — distinguishes habitat (user) from adventure (Coach) */
  owner: string;
  /** Array of Chain objects — array-indexed (D27) */
  chains: Chain[];
  /** [MULTI-USER] stub — null in LOCAL */
  accountability: AccountabilityStub;
  /** Routine review tied to Act — BUILD-time task */
  commitment: Record<string, unknown>;
  /** Action on chain completion, gating logic for next Act — BUILD-time task */
  toggle: Record<string, unknown>;
  completionState: ActCompletionState;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedContacts: SharedContactsStub;
}
