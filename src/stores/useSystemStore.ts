// ─────────────────────────────────────────
// useSystemStore — SYSTEM STORE
// Holds: Settings, session metadata, rollover timestamp.
// Device only — never syncs to cloud.
// MULTI-USER exception: syncs lastRollover timestamp for multi-device coordination (D45).
// ─────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface SystemState {
  settings: Settings | null;
  /** ISO date of last midnight rollover — stored device-only in LOCAL */
  lastRollover: string | null;
  /** ISO date of current session start */
  sessionStart: string | null;
  /**
   * Rollover resumability — the step number (1–9) that was in flight when the
   * app last closed. null = no rollover in progress; 0 = rollover fully complete.
   * On boot: if this is set (1–9), rollover resumes from that step.
   */
  rolloverStep: number | null;
  /**
   * Set false when first-run seeding completes. Set true by the Onboarding
   * Adventure quest on completion (W30). null means value not yet initialised.
   */
  onboardingComplete: boolean | null;
  /** Developer mode — enables dev tools in About popup. Enabled by 5-tap on version string. */
  devMode: boolean;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface SystemActions {
  setSettings: (settings: Settings) => void;
  setLastRollover: (timestamp: string) => void;
  setSessionStart: (timestamp: string) => void;
  setRolloverStep: (step: number | null) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setOnboardingComplete: (complete: boolean) => void;
  setDevMode: (val: boolean) => void;
  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: SystemState = {
  settings: null,
  lastRollover: null,
  sessionStart: null,
  rolloverStep: null,
  onboardingComplete: null,
  devMode: true,
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useSystemStore = create<SystemState & SystemActions>()(
  persist(
    (set) => ({
      ...initialState,

      setSettings: (settings) => {
        set({ settings });
        // TODO: MVP06 — also write via storageLayer(STORAGE_KEY_SETTINGS, settings)
      },

      setLastRollover: (lastRollover) => set({ lastRollover }),

      setSessionStart: (sessionStart) => set({ sessionStart }),

      setRolloverStep: (rolloverStep) => set({ rolloverStep }),

      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),

      setDevMode: (devMode) => set({ devMode }),

      setThemeMode: (mode) =>
        set((state) => {
          const current = state.settings;
          if (current) {
            return {
              settings: {
                ...current,
                displayPreferences: { ...current.displayPreferences, mode },
              },
            };
          }
          return {
            settings: {
              timePreferences: { dayStart: '06:00', weekStart: 'mon' },
              coachPreferences: { tone: 'friendly', trackingSettings: {}, character: 'default' },
              displayPreferences: { mode, theme: 'default' },
              socialPreferences: null,
              notificationPreferences: null,
              storagePreferences: null,
            },
          };
        }),

      reset: () => set(initialState),
    }),
    { name: 'cdb-system' },
  ),
);
