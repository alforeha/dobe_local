// ─────────────────────────────────────────
// useUserStore — USER STORE
// Holds: User, UserStats, Avatar, BadgeBoard, Equipment, Feed.
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import type { User, UserStats, Avatar, BadgeBoard, Equipment, Feed } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface UserState {
  user: User | null;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface UserActions {
  setUser: (user: User) => void;
  setStats: (stats: UserStats) => void;
  setAvatar: (avatar: Avatar) => void;
  setBadgeBoard: (badgeBoard: BadgeBoard) => void;
  setEquipment: (equipment: Equipment) => void;
  setFeed: (feed: Feed) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: UserState = {
  user: null,
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState & UserActions>()((set) => ({
  ...initialState,

  setUser: (_user) => {
    void _user;
    // TODO: implement — persist User singleton to localStorage
  },

  setStats: (_stats) => {
    void _stats;
    // TODO: implement — patch User.progression.stats
  },

  setAvatar: (_avatar) => {
    void _avatar;
    // TODO: implement — patch User.progression.avatar
  },

  setBadgeBoard: (_badgeBoard) => {
    void _badgeBoard;
    // TODO: implement — patch User.progression.badgeBoard
  },

  setEquipment: (_equipment) => {
    void _equipment;
    // TODO: implement — patch User.progression.equipment
  },

  setFeed: (_feed) => {
    void _feed;
    // TODO: implement — patch User.feed
  },

  reset: () => set(initialState),
}));
