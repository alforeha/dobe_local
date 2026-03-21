// ─────────────────────────────────────────
// useUserStore — USER STORE
// Holds: User, UserStats, Avatar, BadgeBoard, Equipment, Feed.
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  /** Add a custom TaskTemplate UUID ref to User.lists.taskLibrary (D34) */
  addTaskTemplateRef: (id: string) => void;
  /** Remove a custom TaskTemplate UUID ref from User.lists.taskLibrary (D34) */
  removeTaskTemplateRef: (id: string) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: UserState = {
  user: null,
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => {
        set({ user });
        // TODO: MVP06 — storageSet(STORAGE_KEY_USER, user)
      },

      setStats: (stats) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, progression: { ...state.user.progression, stats } } }
            : {},
        ),

      setAvatar: (avatar) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, progression: { ...state.user.progression, avatar } } }
            : {},
        ),

      setBadgeBoard: (badgeBoard) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, progression: { ...state.user.progression, badgeBoard } } }
            : {},
        ),

      setEquipment: (equipment) =>
        set((state) =>
          state.user
            ? { user: { ...state.user, progression: { ...state.user.progression, equipment } } }
            : {},
        ),

      setFeed: (feed) =>
        set((state) =>
          state.user ? { user: { ...state.user, feed } } : {},
        ),

      addTaskTemplateRef: (id) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  lists: {
                    ...state.user.lists,
                    taskLibrary: state.user.lists.taskLibrary.includes(id)
                      ? state.user.lists.taskLibrary
                      : [...state.user.lists.taskLibrary, id],
                  },
                },
              }
            : {},
        ),

      removeTaskTemplateRef: (id) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  lists: {
                    ...state.user.lists,
                    taskLibrary: state.user.lists.taskLibrary.filter((ref) => ref !== id),
                  },
                },
              }
            : {},
        ),

      reset: () => set(initialState),
    }),
    { name: 'cdb-user' },
  ),
);
