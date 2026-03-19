// ─────────────────────────────────────────
// useResourceStore — RESOURCE STORE
// Holds: Resources (all 6 types), Useables, Attachments, Badges, Gear.
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Resource, Badge, Gear, Useable, Attachment } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface ResourceState {
  /** Keyed by Resource.id */
  resources: Record<string, Resource>;
  /** Keyed by Badge.id */
  badges: Record<string, Badge>;
  /** Keyed by Gear.id */
  gear: Record<string, Gear>;
  /** Keyed by Useable.id */
  useables: Record<string, Useable>;
  /** Keyed by Attachment.id */
  attachments: Record<string, Attachment>;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface ResourceActions {
  setResource: (resource: Resource) => void;
  removeResource: (id: string) => void;

  setBadge: (badge: Badge) => void;
  removeBadge: (id: string) => void;

  setGear: (gear: Gear) => void;
  removeGear: (id: string) => void;

  setUseable: (useable: Useable) => void;
  removeUseable: (id: string) => void;

  setAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;

  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: ResourceState = {
  resources: {},
  badges: {},
  gear: {},
  useables: {},
  attachments: {},
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

      setBadge: (badge) => {
        set((state) => ({ badges: { ...state.badges, [badge.id]: badge } }));
        // TODO: MVP06 — storageSet(storageKey.badge(badge.id), badge)
      },

      removeBadge: (id) => {
        set((state) => {
          const badges = { ...state.badges };
          delete badges[id];
          return { badges };
        });
      },

      setGear: (gearItem) => {
        set((state) => ({ gear: { ...state.gear, [gearItem.id]: gearItem } }));
        // TODO: MVP06 — storageSet(storageKey.gear(gearItem.id), gearItem)
      },

      removeGear: (id) => {
        set((state) => {
          const gear = { ...state.gear };
          delete gear[id];
          return { gear };
        });
      },

      setUseable: (useable) => {
        set((state) => ({ useables: { ...state.useables, [useable.id]: useable } }));
        // TODO: MVP06 — storageSet(storageKey.useable(useable.id), useable)
      },

      removeUseable: (id) => {
        set((state) => {
          const useables = { ...state.useables };
          delete useables[id];
          return { useables };
        });
      },

      setAttachment: (attachment) => {
        set((state) => ({ attachments: { ...state.attachments, [attachment.id]: attachment } }));
        // TODO: MVP06 — storageSet(storageKey.attachment(attachment.id), attachment)
      },

      removeAttachment: (id) => {
        set((state) => {
          const attachments = { ...state.attachments };
          delete attachments[id];
          return { attachments };
        });
      },

      reset: () => set(initialState),
    }),
    { name: 'cdb-resources' },
  ),
);
