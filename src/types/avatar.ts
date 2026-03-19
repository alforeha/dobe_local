// ─────────────────────────────────────────
// AVATAR — DATA (nested in User)
// Visual representation of the user.
// Visual state (seed → tree) derived at runtime from XP thresholds via CharacterLibrary.
// Stores equipped gear ids and slot taxonomy reference only.
// ─────────────────────────────────────────

/** Keyed by slot name — slot taxonomy is a BUILD-time task */
export type EquippedGear = Record<string, string>; // slotName → Gear.id

/** [MULTI-USER] stub — null in LOCAL */
export type PublicVisibilityStub = null;

/** [APP-STORE] stub — null in LOCAL */
export type AdditionalAnimationsStub = null;

// ── AVATAR ROOT ────────────────────────────────────────────────────────────────

export interface Avatar {
  equippedGear: EquippedGear;
  /** References slot taxonomy version in CharacterLibrary */
  slotTaxonomyRef: string;
  /** [MULTI-USER] stub — null in LOCAL */
  publicVisibility: PublicVisibilityStub;
  /** [APP-STORE] stub — null in LOCAL */
  additionalAnimations: AdditionalAnimationsStub;
}
