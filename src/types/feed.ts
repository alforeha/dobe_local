// ─────────────────────────────────────────
// FEED — CORE (nested in User)
// User mailbox and activity stream.
// Receives pushed entries from Coach, task completions, badge awards, and level-ups.
// Belongs to User — Coach reads and writes but does not own it.
// ─────────────────────────────────────────

export interface FeedEntry {
  commentBlock: string;
  sourceType: string;
  timestamp: string; // ISO date
  /** Optional ref to the triggering object */
  triggerRef?: string;
}

/** [MULTI-USER] stub — null in LOCAL */
export type SharedActivityEntriesStub = null;

// ── FEED ROOT ─────────────────────────────────────────────────────────────────

export interface Feed {
  entries: FeedEntry[];
  /** UI unread indicator — reset on markRead() */
  unreadCount: number;
  /** [MULTI-USER] stub — null in LOCAL */
  sharedActivityEntries: SharedActivityEntriesStub;
}
