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

/**
 * Default usage warning threshold in KB.
 * Fire a console warning when total usage exceeds this value.
 * Configurable at runtime via setWarnThresholdKB().
 */
export const STORAGE_WARN_THRESHOLD_KB = 3000;

// Mutable threshold — default 3000 KB, overridable at runtime
let _warnThresholdKB = STORAGE_WARN_THRESHOLD_KB;

/** Override the warning threshold (KB) at runtime. */
export function setWarnThresholdKB(kb: number): void {
  _warnThresholdKB = kb;
}

// ── USAGE SNAPSHOT ───────────────────────────────────────────────────────────

export interface StorageUsageSnapshot {
  usedBytes: number;
  /** Total used in KB — convenience unit for reporting */
  usedKB: number;
  /** Estimated total available bytes (best-effort) */
  estimatedTotalBytes: number;
  usedPercent: number;
  /** true when usedKB >= current warning threshold KB */
  isAboveWarningThreshold: boolean;
}

// ── CHECK BUDGET ─────────────────────────────────────────────────────────────

/**
 * Estimate current localStorage usage by summing all key + value lengths.
 * Each UTF-16 character occupies 2 bytes.
 */
export function getStorageUsage(): StorageUsageSnapshot {
  let usedBytes = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key !== null) {
      const value = localStorage.getItem(key) ?? '';
      // key + value, each UTF-16 char = 2 bytes
      usedBytes += (key.length + value.length) * 2;
    }
  }
  const usedKB = usedBytes / 1024;
  const usedPercent = (usedBytes / STORAGE_BUDGET_DEFAULT_BYTES) * 100;
  const isAboveWarningThreshold = usedKB >= _warnThresholdKB;
  return {
    usedBytes,
    usedKB,
    estimatedTotalBytes: STORAGE_BUDGET_DEFAULT_BYTES,
    usedPercent,
    isAboveWarningThreshold,
  };
}

/**
 * Check if a pending write of `requiredBytes` would push total usage above
 * the warning threshold. Returns true if the write is safe, false if it
 * would exceed the threshold.
 */
export function checkBudget(requiredBytes: number): boolean {
  const usage = getStorageUsage();
  const projectedKB = (usage.usedBytes + requiredBytes) / 1024;
  return projectedKB < _warnThresholdKB;
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
