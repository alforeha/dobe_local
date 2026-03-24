import { taskTemplateLibrary } from '../../../coach';
import { starterTaskTemplates } from '../../../coach/StarterQuestLibrary';
import type { TaskTemplate } from '../../../types';
import type { Event } from '../../../types/event';
import type { QuickActionsEvent } from '../../../types/event';

// ── ICON MAP ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, string> = {
  check: '✅',
  counter: '🔢',
  sets_reps: '🏋️',
  circuit: '🔄',
  duration: '⏱️',
  timer: '⏳',
  rating: '⭐',
  text: '📝',
  form: '📋',
  choice: '🔘',
  checklist: '☑️',
  scan: '📷',
  log: '📓',
  location_point: '📍',
  location_trail: '🗺️',
  roll: '🎲',
};

const DEFAULT_ICON = '⚡';

export function resolveTaskIcon(template: TaskTemplate | null): string {
  if (!template) return DEFAULT_ICON;
  return ICON_MAP[template.icon.toLowerCase()] ?? DEFAULT_ICON;
}

// ── TEMPLATE RESOLVER ─────────────────────────────────────────────────────────

/** Resolve a TaskTemplate from templateRef — store → JSON bundle → starter */
export function resolveTemplate(
  templateRef: string,
  storeTemplates: Record<string, TaskTemplate>,
): TaskTemplate | null {
  return (
    storeTemplates[templateRef] ??
    taskTemplateLibrary.find((t) => t.id === templateRef) ??
    starterTaskTemplates.find((t) => t.id === templateRef) ??
    null
  );
}

// ── QA EVENT FINDER ──────────────────────────────────────────────────────────

/**
 * Find today's QuickActionsEvent by scanning activeEvents and historyEvents.
 *
 * All paths now use local date keys. The UTC→local helpers below remain to
 * handle any events that were stored with the old UTC key before the fix.
 */
/**
 * Convert a UTC date string "YYYY-MM-DD" (midnight UTC) to the local calendar
 * date "YYYY-MM-DD".  Handles the common case where LuckyDice stores the UTC
 * date which can be one day ahead of the user's local date.
 */
function utcDateStringToLocalIso(utcDate: string): string {
  const d = new Date(utcDate + 'T00:00:00Z');
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function findQAEventForDate(
  activeEvents: Record<string, Event | QuickActionsEvent>,
  historyEvents: Record<string, Event | QuickActionsEvent>,
  dateIso: string, // LOCAL date YYYY-MM-DD
): QuickActionsEvent | undefined {
  const localKey = `qa-${dateIso}`;

  // 1. Direct local-date key lookup
  const byLocalKey = (activeEvents[localKey] ?? historyEvents[localKey]) as QuickActionsEvent | undefined;
  if (byLocalKey?.eventType === 'quickActions') return byLocalKey;

  // 2. Scan all events — handles UTC-keyed events (LuckyDice).
  //    Also converts stored UTC date to local date to handle timezone offset
  //    where toISOString() returns the next calendar day for UTC-X timezones.
  for (const source of [activeEvents, historyEvents]) {
    for (const ev of Object.values(source)) {
      const qa = ev as QuickActionsEvent;
      if (qa.eventType !== 'quickActions') continue;
      if (
        qa.date === dateIso ||
        qa.id === localKey ||
        utcDateStringToLocalIso(qa.date) === dateIso
      ) return qa;
    }
  }

  // 3. Final fallback: UTC/local crossover near midnight can shift the stored
  //    qa.date by a few hours. Allow up to 12 hours of drift (half a day) so
  //    we only ever match the ONE day that is closest — never adjacent days.
  for (const source of [activeEvents, historyEvents]) {
    for (const ev of Object.values(source)) {
      const qa = ev as QuickActionsEvent;
      if (qa.eventType !== 'quickActions') continue;
      const storedMs = new Date(qa.date).getTime();
      const targetMs = new Date(dateIso).getTime();
      const diffDays = Math.abs(storedMs - targetMs) / (1000 * 60 * 60 * 24);
      if (diffDays < 0.5) return qa;
    }
  }

  return undefined;
}
