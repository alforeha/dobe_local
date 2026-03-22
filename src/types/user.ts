// ─────────────────────────────────────────
// USER — CORE SINGLETON
// Root owner of all account data. One per device.
// ─────────────────────────────────────────

import type { UserStats } from './stats';
import type { Avatar } from './avatar';
import type { BadgeBoard } from './badgeBoard';
import type { Equipment } from './equipment';
import type { Feed } from './feed';
import type { GTDItem } from './task';

// ── AUTH (STUB) ────────────────────────────────────────────────────────────────

/** [MULTI-USER] auth shape — null in LOCAL */
export type AuthStub = null;

// ── SUB-OBJECTS ────────────────────────────────────────────────────────────────

export interface UserSystem {
  id: string; // uuid
  displayName: string; // settable annually
  wrappedAnchor: string; // ISO date — gates annual review (D31)
  /** [MULTI-USER] stub — null in LOCAL */
  auth: AuthStub;
}

export interface UserPersonal {
  nameFirst: string;
  nameLast: string;
  handle: string;
  birthday: string; // ISO date
}

export type StatGroupKey = 'health' | 'strength' | 'agility' | 'defense' | 'charisma' | 'wisdom';

export type StatGroups = Record<StatGroupKey, number>;

export interface UserProgression {
  stats: UserStats;
  avatar: Avatar;
  badgeBoard: BadgeBoard;
  equipment: Equipment;
  gold: number;
  statGroups: StatGroups;
  /** [future] talent tree — null in LOCAL */
  talentTree: null;
}

export interface UserLists {
  /** User custom TaskTemplate refs (D34) */
  taskLibrary: string[];
  /** TaskTemplate refs */
  favouritesList: string[];
  /** Task refs (D05) — system/resource/quest-generated */
  gtdList: string[];
  /** Tagged item lists */
  shoppingLists: ShoppingList[];
  /** Manual GTD items — user-created (MVP11 W19) */
  manualGtdList: GTDItem[];
}

export interface ShoppingItem {
  /** uuid */
  id: string;
  /** Display name — may mirror a Useable name */
  name: string;
  /** Optional Useable Resource ref */
  useableRef: string | null;
  quantity: number | null;
  unit: string | null;
  /** Optional Account Resource ref — enables pending transaction flow on completion */
  accountRef: string | null;
  completed: boolean;
  completedAt: string | null; // ISO date
}

export interface ShoppingList {
  /** uuid */
  id: string;
  /** List name / tag — e.g. "Groceries", "Hardware" */
  name: string;
  items: ShoppingItem[];
}

export interface UserResources {
  homes: string[];
  vehicles: string[];
  contacts: string[];
  accounts: string[];
  inventory: string[];
  docs: string[];
}

/** [MULTI-USER] stub — null in LOCAL */
export type PublicProfileStub = null;

// ── USER ROOT ──────────────────────────────────────────────────────────────────

export interface User {
  system: UserSystem;
  personal: UserPersonal;
  progression: UserProgression;
  lists: UserLists;
  resources: UserResources;
  feed: Feed;
  /** [MULTI-USER] stub — null in LOCAL */
  publicProfile: PublicProfileStub;
}
