// ─────────────────────────────────────────
// useProgressionStore — PROGRESSION STORE
// Holds: Acts (nested Chains, Quests, Milestones, Markers).
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import type { Act } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface ProgressionState {
  /** Keyed by Act.id for O(1) access */
  acts: Record<string, Act>;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface ProgressionActions {
  setAct: (act: Act) => void;
  removeAct: (actId: string) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: ProgressionState = {
  acts: {},
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useProgressionStore = create<ProgressionState & ProgressionActions>()((set) => ({
  ...initialState,

  setAct: (_act) => {
    void _act;
    // TODO: implement — upsert to acts map, persist to localStorage key act:{uuid}
  },

  removeAct: (_actId) => {
    void _actId;
    // TODO: implement — remove from acts map, remove from localStorage
  },

  reset: () => set(initialState),
}));
