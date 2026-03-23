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
 * LuckyDiceSection uses UTC date for event keys (toISOString().slice(0,10))
 * while listsEngine uses LOCAL date. To handle both, we:
 *  1. Try the local-date key directly.
 *  2. Try the UTC-date key directly.
 *  3. Scan all events for any QuickActionsEvent whose id or date matches.
 */
export function findQAEventForDate(
  activeEvents: Record<string, Event | QuickActionsEvent>,
  historyEvents: Record<string, Event | QuickActionsEvent>,
  dateIso: string, // LOCAL date YYYY-MM-DD
): QuickActionsEvent | undefined {
  const localKey = `qa-${dateIso}`;

  // 1. Direct local-date key lookup
  const byLocalKey = (activeEvents[localKey] ?? historyEvents[localKey]) as QuickActionsEvent | undefined;
  if (byLocalKey?.eventType === 'quickActions') return byLocalKey;

  // 2. Scan all events — handles UTC-keyed events (LuckyDice)
  for (const source of [activeEvents, historyEvents]) {
    for (const ev of Object.values(source)) {
      const qa = ev as QuickActionsEvent;
      if (qa.eventType !== 'quickActions') continue;
      // Match by date field or by id containing the local date
      if (qa.date === dateIso || qa.id === localKey) return qa;
    }
  }

  // 3. Final fallback: find ANY active QA event whose id starts with 'qa-' and whose date
  //    is close to dateIso — for UTC/local crossover near midnight.
  //    We check if the stored qa.date and dateIso differ by at most 1 day.
  for (const source of [activeEvents, historyEvents]) {
    for (const ev of Object.values(source)) {
      const qa = ev as QuickActionsEvent;
      if (qa.eventType !== 'quickActions') continue;
      const storedMs = new Date(qa.date).getTime();
      const targetMs = new Date(dateIso).getTime();
      const diffDays = Math.abs(storedMs - targetMs) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) return qa;
    }
  }

  return undefined;
}
