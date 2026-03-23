// ─────────────────────────────────────────
// AboutPopup — MVP11 W32
// Shown when user taps ℹ️ in CoachOverlayHeader.
// Contains app info, version, devMode unlock (5-tap on version string),
// and dev tools (Trigger Rollover, Clear All Data) when devMode is active.
// ─────────────────────────────────────────

import { useState } from 'react';
import { useSystemStore } from '../../../stores/useSystemStore';
import { executeRollover } from '../../../engine/rollover';
import { localISODate, addDays } from '../../../utils/dateUtils';

const APP_VERSION = '0.1.0-local';

function tomorrowISO(): string {
  return localISODate(addDays(new Date(), 1));
}

function todayDisplay(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface AboutPopupProps {
  onClose: () => void;
}

export function AboutPopup({ onClose }: AboutPopupProps) {
  const devMode = useSystemStore((s) => s.devMode);
  const setDevMode = useSystemStore((s) => s.setDevMode);
  const lastRollover = useSystemStore((s) => s.lastRollover);
  const [versionTaps, setVersionTaps] = useState(0);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [skippingWeek, setSkippingWeek] = useState(false);

  function handleVersionTap() {
    if (devMode) return;
    const next = versionTaps + 1;
    setVersionTaps(next);
    if (next >= 5) {
      setDevMode(true);
    }
  }

  async function handleTriggerRollover() {
    if (rolling) return;
    setRolling(true);
    try {
      await executeRollover(tomorrowISO());
      window.location.reload();
    } catch (err) {
      setRolling(false);
      alert(`Rollover failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleSkipWeek() {
    if (skippingWeek) return;
    setSkippingWeek(true);
    try {
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const date = localISODate(addDays(today, i));
        await executeRollover(date);
      }
      window.location.reload();
    } catch (err) {
      setSkippingWeek(false);
      alert(`Week skip failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function handleClearData() {
    if (!clearConfirm) {
      setClearConfirm(true);
      return;
    }
    // Explicitly remove Zustand persist keys (source of truth per D83).
    // These are NOT covered by storageClear() which only handles app-layer keys.
    localStorage.removeItem('cdb-system');
    localStorage.removeItem('cdb-user');
    localStorage.removeItem('cdb-progression');
    localStorage.removeItem('cdb-schedule');
    localStorage.removeItem('cdb-resources');
    // Wipe remaining app-layer keys via full clear (dev tool — intentional)
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-10 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">About</h2>
          <button
            type="button"
            aria-label="Close about"
            onClick={onClose}
            className="text-gray-400 text-xl hover:text-gray-600 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* App identity */}
        <div className="flex flex-col items-center gap-1 py-2">
          <span className="text-5xl">🐸</span>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">CAN-DO-BE</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">Your life. Your quest.</p>
          <button
            type="button"
            onClick={handleVersionTap}
            className="mt-1 text-xs text-gray-400 dark:text-gray-500 select-none"
            aria-label="Version"
          >
            v{APP_VERSION}
            {devMode && (
              <span className="ml-2 text-amber-500 font-semibold">[DEV]</span>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
          A personal life-management app that turns your goals, routines, and resources into a daily quest.
        </p>

        {/* Today's date */}
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">{todayDisplay()}</p>

        {/* Dev tools — only shown in devMode */}
        {devMode && (
          <div className="mt-2 flex flex-col gap-3 border-t border-amber-200 dark:border-amber-800 pt-4">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Dev Tools</p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              App date:{' '}
              <span className="font-mono text-amber-700 dark:text-amber-300">
                {lastRollover ?? 'not set'}
              </span>
            </p>

            <button
              type="button"
              onClick={handleTriggerRollover}
              disabled={rolling || skippingWeek}
              className="w-full py-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800 disabled:opacity-50 transition-colors"
            >
              {rolling ? 'Rolling over…' : 'Trigger Rollover'}
            </button>

            <button
              type="button"
              onClick={handleSkipWeek}
              disabled={rolling || skippingWeek}
              className="w-full py-2 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800 disabled:opacity-50 transition-colors"
            >
              {skippingWeek ? 'Skipping 7 days…' : 'Skip Forward 1 Week'}
            </button>

            <button
              type="button"
              onClick={handleClearData}
              className="w-full py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              {clearConfirm ? '⚠️ Tap again to confirm clear' : 'Clear All Data'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
