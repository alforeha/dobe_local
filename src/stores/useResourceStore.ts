// ─────────────────────────────────────────
// useResourceStore — RESOURCE STORE
// Holds: Resources (all 6 types), Useables, Attachments, Badges, Gear.
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resource } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface ResourceState {
  /** Keyed by Resource.id */
  resources: Record<string, Resource>;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface ResourceActions {
  setResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: ResourceState = {
  resources: {},
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useResourceStore = create<ResourceState & ResourceActions>()(
  persist(
    (set) => ({
      ...initialState,

      setResource: (resource) => {
        set((state) => ({ resources: { ...state.resources, [resource.id]: resource } }));
        // TODO: MVP06 — storageSet(storageKey.resource(resource.id), resource)
      },

      removeResource: (id) => {
        set((state) => {
          const resources = { ...state.resources };
          delete resources[id];
          return { resources };
        });
      },

      reset: () => set(initialState),
    }),
    { name: 'cdb-resources' },
  ),
);
