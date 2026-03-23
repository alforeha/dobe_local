import { useSystemStore } from '../stores/useSystemStore';

/**
 * Returns the app's current date as a midnight-local Date object.
 * Uses lastRollover from the system store when set (dev skip-forward or
 * completed rollover), otherwise falls back to the real local date.
 *
 * Use this everywhere a component needs to know "what day is today"
 * so that dev-tool time travel is reflected throughout the UI.
 */
export function useAppDate(): Date {
  const lastRollover = useSystemStore((s) => s.lastRollover);
  const d = lastRollover ? new Date(lastRollover + 'T00:00:00') : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
