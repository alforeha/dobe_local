// ─────────────────────────────────────────
// STORAGE BUDGET
// Usage tracking, threshold warning, and eviction hook for localStorage.
// localStorage limit varies by browser/platform — typically 5–10 MB.
// Capacitor on device may expose a higher quota.
// No logic implemented yet — shells only.
// ─────────────────────────────────────────

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

/** Conservative default estimate for web localStorage (bytes) */
export const STORAGE_BUDGET_DEFAULT_BYTES = 5 * 1024 * 1024; // 5 MB

/** Warn at 80 % of estimated budget */
export const STORAGE_BUDGET_WARN_THRESHOLD = 0.8;

/** Attachment max size — 200 KB per D09 */
export const ATTACHMENT_MAX_BYTES = 200 * 1024; // 200 KB

/** Max attachments per Event — D09 */
export const EVENT_MAX_ATTACHMENTS = 5;

// ── USAGE SNAPSHOT ───────────────────────────────────────────────────────────

export interface StorageUsageSnapshot {
  usedBytes: number;
  /** Estimated total available bytes (best-effort) */
  estimatedTotalBytes: number;
  usedPercent: number;
  isAboveWarningThreshold: boolean;
}

// ── CHECK BUDGET ─────────────────────────────────────────────────────────────

/**
 * Estimate current localStorage usage.
 * Returns a StorageUsageSnapshot.
 */
export function getStorageUsage(): StorageUsageSnapshot {
  // TODO: implement — iterate localStorage keys, sum JSON string lengths * 2 (UTF-16)
  return {
    usedBytes: 0,
    estimatedTotalBytes: STORAGE_BUDGET_DEFAULT_BYTES,
    usedPercent: 0,
    isAboveWarningThreshold: false,
  };
}

/**
 * Check if a pending write of `requiredBytes` would exceed the warning threshold.
 * Returns true if safe to write, false if budget would be exceeded.
 */
export function checkBudget(requiredBytes: number): boolean {
  // TODO: implement
  void requiredBytes;
  return true;
}

// ── EVICTION HOOK ─────────────────────────────────────────────────────────────

/**
 * Eviction strategy hook — called by storageSet when budget is critically low.
 * Default strategy: candidate = oldest history Event entries.
 * Override by replacing this reference before first write:
 *   import { setEvictionHandler } from './storageBudget';
 *   setEvictionHandler(myFn);
 */
let _evictionHandler: (snapshot: StorageUsageSnapshot) => void = (snapshot) => {
  // TODO: implement default eviction strategy
  // - Identify oldest Event refs in history
  // - Remove from localStorage + update useScheduleStore
  void snapshot;
};

export function setEvictionHandler(
  fn: (snapshot: StorageUsageSnapshot) => void,
): void {
  _evictionHandler = fn;
}

export function runEvictionHandler(snapshot: StorageUsageSnapshot): void {
  _evictionHandler(snapshot);
}
