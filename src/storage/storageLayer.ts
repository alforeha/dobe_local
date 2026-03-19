// ─────────────────────────────────────────
// STORAGE LAYER
// Typed get / set / delete / list / clear wrappers over localStorage.
// No logic implemented yet — shells only.
// ─────────────────────────────────────────

// ── GET ───────────────────────────────────────────────────────────────────────

/**
 * Retrieve and deserialise a value from localStorage.
 * Returns null if the key does not exist or JSON.parse fails.
 */
export function storageGet<T>(key: string): T | null {
  // TODO: implement
  void key;
  return null;
}

// ── SET ───────────────────────────────────────────────────────────────────────

/**
 * Serialise and write a value to localStorage.
 * Throws StorageQuotaError if the write exceeds available budget.
 */
export function storageSet<T>(key: string, value: T): void {
  // TODO: implement — call storageBudget.checkBudget() before write
  void key;
  void value;
}

// ── DELETE ────────────────────────────────────────────────────────────────────

/**
 * Remove a single key from localStorage.
 */
export function storageDelete(key: string): void {
  // TODO: implement
  void key;
}

// ── LIST ──────────────────────────────────────────────────────────────────────

/**
 * Return all localStorage keys matching the given prefix (e.g. 'act:').
 */
export function storageList(prefix: string): string[] {
  // TODO: implement
  void prefix;
  return [];
}

// ── CLEAR ─────────────────────────────────────────────────────────────────────

/**
 * Remove all CAN-DO-BE keys from localStorage.
 * Does NOT clear unrelated third-party keys.
 */
export function storageClear(): void {
  // TODO: implement — iterate storageList() for each known prefix + singleton keys
}

// ── ERROR TYPES ───────────────────────────────────────────────────────────────

export class StorageQuotaError extends Error {
  constructor(key: string, requiredBytes: number, availableBytes: number) {
    super(
      `StorageQuotaError: cannot write "${key}". ` +
        `Required ${requiredBytes}B, available ${availableBytes}B.`,
    );
    this.name = 'StorageQuotaError';
  }
}
