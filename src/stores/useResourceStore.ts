// ─────────────────────────────────────────
// useResourceStore — RESOURCE STORE
// Holds: Resources (all 6 types), Useables, Attachments, Badges, Gear.
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
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

export const useResourceStore = create<ResourceState & ResourceActions>()((set) => ({
  ...initialState,

  setResource: (_resource) => {
    void _resource;
    // TODO: implement — upsert, persist to localStorage key resource:{uuid}
  },

  removeResource: (_id) => {
    void _id;
    // TODO: implement
  },

  setBadge: (_badge) => {
    void _badge;
    // TODO: implement — persist to localStorage key badge:{uuid}
  },

  removeBadge: (_id) => {
    void _id;
    // TODO: implement
  },

  setGear: (_gear) => {
    void _gear;
    // TODO: implement — persist to localStorage key gear:{uuid}
  },

  removeGear: (_id) => {
    void _id;
    // TODO: implement
  },

  setUseable: (_useable) => {
    void _useable;
    // TODO: implement — persist to localStorage key useable:{uuid}
  },

  removeUseable: (_id) => {
    void _id;
    // TODO: implement
  },

  setAttachment: (_attachment) => {
    void _attachment;
    // TODO: implement — persist to localStorage key attachment:{uuid}
  },

  removeAttachment: (_id) => {
    void _id;
    // TODO: implement
  },

  reset: () => set(initialState),
}));
