// ─────────────────────────────────────────
// BADGE BOARD — DATA (nested in User)
// Holds earned badges awaiting claim and manages the user-curated pinned display.
// Coach checks earned[] on session open and prompts claim if not empty.
// ─────────────────────────────────────────

import type { Badge } from './itemTemplate';

/** [MULTI-USER] stub — null in LOCAL */
export type BadgeBoardPublicVisibilityStub = null;

// ── BADGE BOARD ROOT ──────────────────────────────────────────────────────────

export interface BadgeBoard {
  /** Badge refs awarded but not yet placed by user */
  earned: Badge[];
  /** Badge refs placed on board by user */
  pinned: Badge[];
  /** [MULTI-USER] stub — null in LOCAL */
  publicVisibility: BadgeBoardPublicVisibilityStub;
}
