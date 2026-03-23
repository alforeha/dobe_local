import { useUserStore } from '../../stores/useUserStore';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { localISODate } from '../../utils/dateUtils';
import { STARTER_TEMPLATE_IDS } from '../../coach/StarterQuestLibrary';
import type { QuickActionsEvent } from '../../types';
import type { RollInputFields } from '../../types';
import type { Event } from '../../types';

/** Scan active + history events for today's QA event, handling UTC/local key mismatch */
function findTodayQAEvent(
  activeEvents: Record<string, Event | QuickActionsEvent>,
  historyEvents: Record<string, Event | QuickActionsEvent>,
): QuickActionsEvent | undefined {
  const todayLocal = localISODate(new Date());
  const todayUTC = new Date().toISOString().slice(0, 10);

  for (const source of [activeEvents, historyEvents]) {
    // Try direct key lookups first (fast path)
    for (const key of [`qa-${todayLocal}`, `qa-${todayUTC}`]) {
      const ev = source[key] as QuickActionsEvent | undefined;
      if (ev?.eventType === 'quickActions') return ev;
    }
    // Scan all events for any QA event matching today (handles any key format)
    for (const ev of Object.values(source)) {
      const qa = ev as QuickActionsEvent;
      if (qa.eventType === 'quickActions' && (qa.date === todayLocal || qa.date === todayUTC)) return qa;
    }
  }
  return undefined;
}

export function BoostRow() {
  const user = useUserStore((s) => s.user);
  const streak = user?.progression?.stats?.milestones?.streakCurrent ?? 0;
  const gold = user?.progression?.gold ?? 0;

  const { activeEvents, historyEvents, tasks } = useScheduleStore(
    useShallow((s) => ({
      activeEvents: s.activeEvents,
      historyEvents: s.historyEvents,
      tasks: s.tasks,
    })),
  );

  const qaEvent = findTodayQAEvent(activeEvents, historyEvents);

  // Find ROLL completion — uses exact templateRef match, same as LuckyDiceSection
  // If task isn't in store (edge case) fall back to detecting by templateRef prefix
  const rollCompletion = qaEvent?.completions.find((c) => {
    const task = tasks[c.taskRef];
    if (task) return task.templateRef === STARTER_TEMPLATE_IDS.roll;
    // Task missing from store: not enough info to confirm ROLL — skip
    return false;
  });

  const rollTask = rollCompletion ? tasks[rollCompletion.taskRef] : undefined;
  const rollFields = rollTask ? (rollTask.resultFields as unknown as RollInputFields) : undefined;
  const diceBoost = rollFields?.boostApplied ?? (rollCompletion ? '×?' : null);

  return (
    <div className="flex items-center justify-between">
      {/* Left: active boosts + streak */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-amber-500" title="Streak">🔥 {streak}</span>
        {/* Dice boost — shown when user has rolled today */}
        {diceBoost !== null && (
          <span className="text-xs text-purple-600 font-semibold" title="Daily dice boost">
            🎲 {diceBoost}
          </span>
        )}
      </div>
      {/* Right: gold value */}
      <span className="text-xs font-semibold text-yellow-600">💰 {gold}</span>
    </div>
  );
}
