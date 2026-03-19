// ─────────────────────────────────────────
// useSystemStore — SYSTEM STORE
// Holds: Settings, session metadata, rollover timestamp.
// Device only — never syncs to cloud.
// MULTI-USER exception: syncs lastRollover timestamp for multi-device coordination (D45).
// ─────────────────────────────────────────

import { create } from 'zustand';
import type { Settings } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface SystemState {
  settings: Settings | null;
  /** ISO date of last midnight rollover — stored device-only in LOCAL */
  lastRollover: string | null;
  /** ISO date of current session start */
  sessionStart: string | null;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface SystemActions {
  setSettings: (settings: Settings) => void;
  setLastRollover: (timestamp: string) => void;
  setSessionStart: (timestamp: string) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: SystemState = {
  settings: null,
  lastRollover: null,
  sessionStart: null,
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useSystemStore = create<SystemState & SystemActions>()((set) => ({
  ...initialState,

  setSettings: (_settings) => {
    // TODO: implement — persist to localStorage via storageLayer
  },

  setLastRollover: (_timestamp) => {
    // TODO: implement
  },

  setSessionStart: (_timestamp) => {
    // TODO: implement
  },

  reset: () => set(initialState),
}));
