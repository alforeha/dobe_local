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
  /** Mark a single feed entry as read by index; decrements unreadCount if it was unread */
  markFeedEntryRead: (index: number) => void;
  /** Mark all feed entries as read and reset unreadCount to 0 */
  markAllFeedRead: () => void;
  /** Toggle a reaction key on a feed entry */
  toggleFeedReaction: (index: number, reaction: string) => void;
  /** Add a custom TaskTemplate UUID ref to User.lists.taskLibrary (D34) */
  addTaskTemplateRef: (id: string) => void;
  /** Remove a custom TaskTemplate UUID ref from User.lists.taskLibrary (D34) */
  removeTaskTemplateRef: (id: string) => void;
  /** Add a PlannedEvent (Routine) UUID ref to User.lists.routineRefs */
  addRoutineRef: (id: string) => void;
  /** Remove a PlannedEvent (Routine) UUID ref from User.lists.routineRefs */
  removeRoutineRef: (id: string) => void;
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

      markFeedEntryRead: (index) =>
        set((state) => {
          if (!state.user) return {};
          const entries = state.user.feed.entries;
          if (!entries[index] || entries[index].read) return {};
          const updated = entries.map((e, i) =>
            i === index ? { ...e, read: true } : e,
          );
          const newUnread = Math.max(0, state.user.feed.unreadCount - 1);
          return {
            user: {
              ...state.user,
              feed: { ...state.user.feed, entries: updated, unreadCount: newUnread },
            },
          };
        }),

      markAllFeedRead: () =>
        set((state) => {
          if (!state.user) return {};
          const updated = state.user.feed.entries.map((e) => ({ ...e, read: true }));
          return {
            user: {
              ...state.user,
              feed: { ...state.user.feed, entries: updated, unreadCount: 0 },
            },
          };
        }),

      toggleFeedReaction: (index, reaction) =>
        set((state) => {
          if (!state.user) return {};
          const entries = state.user.feed.entries;
          if (!entries[index]) return {};
          const current = entries[index].reactions ?? [];
          const next = current.includes(reaction)
            ? current.filter((r) => r !== reaction)
            : [...current, reaction];
          const updated = entries.map((e, i) =>
            i === index ? { ...e, reactions: next } : e,
          );
          return {
            user: {
              ...state.user,
              feed: { ...state.user.feed, entries: updated },
            },
          };
        }),

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

      addRoutineRef: (id) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  lists: {
                    ...state.user.lists,
                    routineRefs: (state.user.lists.routineRefs ?? []).includes(id)
                      ? (state.user.lists.routineRefs ?? [])
                      : [...(state.user.lists.routineRefs ?? []), id],
                  },
                },
              }
            : {},
        ),

      removeRoutineRef: (id) =>
        set((state) =>
          state.user
            ? {
                user: {
                  ...state.user,
                  lists: {
                    ...state.user.lists,
                    routineRefs: (state.user.lists.routineRefs ?? []).filter((ref) => ref !== id),
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
