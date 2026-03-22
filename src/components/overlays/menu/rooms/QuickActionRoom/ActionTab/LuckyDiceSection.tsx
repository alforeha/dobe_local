import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { awardXP, awardStat } from '../../../../../../engine/awardPipeline';
import { STARTER_TEMPLATE_IDS } from '../../../../../../coach/StarterQuestLibrary';
import type { Task } from '../../../../../../types/task';
import type { QuickActionsEvent } from '../../../../../../types/event';
import type { RollInputFields } from '../../../../../../types/taskTemplate';

// ── Lucky Dice Section — D78
// Renders a single roll-per-day dice section in the Quick Action room.
// On roll: creates a ROLL Task, stores result, awards XP based on result.
// Locked for the rest of the day once rolled.

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const SIDES = 6;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTodayRoll(
  tasks: Record<string, Task>,
  qaCompletions: { taskRef: string; completedAt: string }[],
): { result: number; boostApplied: string } | null {
  for (const completion of qaCompletions) {
    const task = tasks[completion.taskRef];
    if (!task) continue;
    if (task.templateRef !== STARTER_TEMPLATE_IDS.roll) continue;
    if (task.completionState !== 'complete') continue;
    const rf = task.resultFields as Partial<RollInputFields>;
    if (rf.result != null) {
      return { result: rf.result, boostApplied: rf.boostApplied ?? `${(1 + rf.result * 0.1).toFixed(1)}x` };
    }
  }
  return null;
}

export function LuckyDiceSection() {
  const tasks = useScheduleStore((s) => s.tasks);
  const activeEvents = useScheduleStore((s) => s.activeEvents);
  const scheduleStore = useScheduleStore.getState;
  const user = useUserStore((s) => s.user);

  const today = todayISO();
  const qaId = `qa-${today}`;
  const qa = activeEvents[qaId] as QuickActionsEvent | undefined;
  const completions = qa?.completions ?? [];

  const todayRoll = getTodayRoll(tasks, completions);

  const [rolling, setRolling] = useState(false);
  const [animFace, setAnimFace] = useState<string>(DIE_FACES[0]);

  const handleRoll = useCallback(() => {
    if (rolling || todayRoll || !user) return;

    setRolling(true);
    const result = Math.floor(Math.random() * SIDES) + 1;
    const boostApplied = `${(1 + result * 0.1).toFixed(1)}x`;
    let ticks = 0;

    const id = window.setInterval(() => {
      setAnimFace(DIE_FACES[Math.floor(Math.random() * SIDES)]);
      ticks++;
      if (ticks >= 12) {
        window.clearInterval(id);
        setRolling(false);

        const store = scheduleStore();
        const now = new Date().toISOString();
        const taskId = uuidv4();

        const rollTask: Task = {
          id: taskId,
          templateRef: STARTER_TEMPLATE_IDS.roll,
          completionState: 'complete',
          completedAt: now,
          resultFields: { sides: SIDES, result, boostApplied } satisfies Partial<RollInputFields>,
          attachmentRef: null,
          resourceRef: null,
          location: null,
          sharedWith: null,
          questRef: null,
          actRef: null,
          secondaryTag: 'fitness',
        };

        store.setTask(rollTask);

        // Write to today's QA event — create one if rollover hasn't run yet (B04)
        const freshQa = store.activeEvents[qaId] as QuickActionsEvent | undefined;
        const baseQa: QuickActionsEvent = freshQa ?? {
          id: qaId,
          eventType: 'quickActions',
          date: today,
          completions: [],
          xpAwarded: 0,
          sharedCompletions: null,
        };
        const updatedQa: QuickActionsEvent = {
          ...baseQa,
          completions: [...baseQa.completions, { taskRef: taskId, completedAt: now }],
        };
        store.setActiveEvent(updatedQa);

        // Award XP: result * 10 agility (range 10–60 XP)
        const xpAmount = result * 10;
        awardXP(user.system.id, xpAmount);
        awardStat(user.system.id, 'agility', result);
      }
    }, 80);
  }, [rolling, todayRoll, user, today, qaId, scheduleStore]);

  const dieFace = todayRoll
    ? (DIE_FACES[todayRoll.result - 1] ?? '🎲')
    : rolling
      ? animFace
      : '🎲';

  return (
    <div className="mb-5">
      <div className="mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Lucky Dice
        </h3>
      </div>

      <div className="flex items-center gap-4 px-3 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
        <span className="text-4xl select-none transition-transform duration-75 shrink-0">
          {dieFace}
        </span>

        {todayRoll ? (
          <div className="flex-1">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Rolled {todayRoll.result} — {todayRoll.boostApplied}
            </p>
            <p className="text-xs text-gray-400">Today&apos;s roll is locked</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Daily Roll
              </p>
              <p className="text-xs text-gray-400">Roll once per day for an XP boost</p>
            </div>
            <button
              type="button"
              disabled={rolling}
              onClick={handleRoll}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors
                ${rolling
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                }`}
            >
              {rolling ? '…' : 'Roll'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
