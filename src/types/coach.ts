// ─────────────────────────────────────────
// COACH — APP BUNDLE TYPES (scope: APP)
// Pure function engine. Reads from Zustand stores, returns results, never owns state.
// No LLM ever (D11). No Zustand store (D44).
//
// Contains types for the 4 libraries that live in the Coach app bundle:
//   AchievementLibrary, CommentLibrary, RecommendationsLibrary, CharacterLibrary.
// ─────────────────────────────────────────

import type { TaskTemplate, RecurrenceRule, XpAward } from './taskTemplate';

// ── ACHIEVEMENT LIBRARY ───────────────────────────────────────────────────────

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  /** Icon ref for Badge rendering */
  icon: string;
  /** Sticker ref for BadgeBoard display */
  sticker: string;
  /** Condition expression — BUILD-time task */
  condition: Record<string, unknown>;
  /** Gear id to drop on award (optional) */
  gearReward: string | null;
}

export interface AchievementLibrary {
  achievements: AchievementDefinition[];
}

// ── COMMENT LIBRARY ───────────────────────────────────────────────────────────
// Keyed collection of comment copy Coach draws from via ribbet().
// Tone variants per context entry.

export type CoachTone = 'encouraging' | 'direct' | 'playful' | string;

export interface CommentEntry {
  /** Context key taxonomy — BUILD-time task */
  contextKey: string;
  variants: Record<CoachTone, string[]>;
}

export interface CommentLibrary {
  comments: CommentEntry[];
}

// ── RECOMMENDATIONS LIBRARY ───────────────────────────────────────────────────
// Prebuilt TaskTemplates and PlannedEvents Coach can suggest or assign.
// Organised by stat group.

export type StatGroupKey = 'health' | 'strength' | 'agility' | 'defense' | 'charisma' | 'wisdom';

export interface RecommendedTask {
  id: string;
  statGroup: StatGroupKey;
  template: TaskTemplate;
  /** Prebuilt RecurrenceRule suggestion */
  suggestedRecurrence: RecurrenceRule | null;
}

export interface RecommendedPlannedEvent {
  id: string;
  statGroup: StatGroupKey;
  name: string;
  description: string;
  taskTemplateRefs: string[];
  suggestedRecurrence: RecurrenceRule | null;
}

export interface RecommendationsLibrary {
  tasks: RecommendedTask[];
  plannedEvents: RecommendedPlannedEvent[];
}

// ── CHARACTER LIBRARY ─────────────────────────────────────────────────────────
// Holds all visual asset definitions for Avatar states, Coach characters,
// holiday overlays, gear models, and XP level threshold table.

export interface AvatarState {
  /** e.g. 'seed' | 'sprout' | 'sapling' | 'tree' */
  stateKey: string;
  xpThreshold: number;
  assetRef: string;
}

export interface CoachCharacter {
  id: string;
  name: string;
  assetRef: string;
  /** Holiday overlay refs — BUILD-time task */
  holidayOverlays: Record<string, string>;
  /** true = default frog character */
  isDefault: boolean;
}

export interface GearDefinition {
  id: string;
  slot: string;
  rarity: string;
  assetRef: string;
}

export interface XpLevelThreshold {
  level: number;
  xpRequired: number;
}

export interface SlotTaxonomyVersion {
  version: string;
  slots: string[];
}

export interface CharacterLibrary {
  avatarStates: AvatarState[];
  coachCharacters: CoachCharacter[];
  gearDefinitions: GearDefinition[];
  /** RuneScape exponential curve thresholds (D43) — exact values BUILD-time task */
  xpLevelThresholds: XpLevelThreshold[];
  slotTaxonomy: SlotTaxonomyVersion;
}

// ── COACH OBJECT ─────────────────────────────────────────────────────────────
// Properties the Coach function engine carries in its app bundle context.

export interface CoachProperties {
  achievementLibrary: AchievementLibrary;
  commentLibrary: CommentLibrary;
  recommendationsLibrary: RecommendationsLibrary;
  characterLibrary: CharacterLibrary;
  /** Active theme applied when Settings.displayPreferences.theme === 'default' */
  activeTheme: string;
  /** Active character id — read from Settings.coachPreferences.character at call time (D26) */
  activeCharacterId: string;
  /** Active tone — read from Settings.coachPreferences.tone at call time (D26) */
  activeTone: CoachTone;
  /** Seasonal/holiday overlay state */
  seasonalOverlay: string | null;
  /** XP award shape used when no explicit award is defined — +5 to assigned stat group */
  defaultXpAward: XpAward;
}
