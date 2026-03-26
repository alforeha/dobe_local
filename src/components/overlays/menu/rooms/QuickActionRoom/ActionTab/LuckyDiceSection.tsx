import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { awardXP, awardStat } from '../../../../../../engine/awardPipeline';
import { STARTER_TEMPLATE_IDS } from '../../../../../../coach/StarterQuestLibrary';
import { getAppDate } from '../../../../../../utils/dateUtils';
import type { Task } from '../../../../../../types/task';
import type { QuickActionsEvent } from '../../../../../../types/event';
import type { RollInputFields } from '../../../../../../types/taskTemplate';
import { GlowRing } from '../../../../../shared/GlowRing';
import { ONBOARDING_GLOW } from '../../../../../../constants/onboardingKeys';
import { useGlows } from '../../../../../../hooks/useOnboardingGlow';
import { autoCheckQuestItem } from '../../../../../../engine/resourceEngine';

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const SIDES = 6;

function todayISO(): string {
  return getAppDate();
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
      return { result: rf.result, boostApplied: rf.boostApplied ?? `x${rf.result}` };
    }
  }
  return null;
}

export function LuckyDiceSection({ compact = false }: { compact?: boolean }) {
  const tasks = useScheduleStore((s) => s.tasks);
  const activeEvents = useScheduleStore((s) => s.activeEvents);
  const scheduleStore = useScheduleStore.getState;
  const user = useUserStore((s) => s.user);
  const luckyDiceGlows = useGlows(ONBOARDING_GLOW.LUCKY_DICE);

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
    const boostApplied = `x${result}`;
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

        const xpAmount = result * 10;
        awardXP(user.system.id, xpAmount);
        awardStat(user.system.id, 'agility', result);
        autoCheckQuestItem(STARTER_TEMPLATE_IDS.learnGrounds, 'complete_roll');
      }
    }, 80);
  }, [rolling, todayRoll, user, today, qaId, scheduleStore]);

  if (compact) {
    if (todayRoll) {
      const face = DIE_FACES[todayRoll.result - 1] ?? String(todayRoll.result);
      return (
        <div className="flex flex-col items-center justify-center gap-0.5">
          <span className="text-3xl select-none leading-none">{face}</span>
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 leading-tight">
            x{todayRoll.result} Bonus
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <span className="text-3xl select-none leading-none transition-transform duration-75">
          {rolling ? animFace : '🎲'}
        </span>
        <GlowRing active={luckyDiceGlows} className="inline-flex">
          <button
            type="button"
            disabled={rolling}
            onClick={handleRoll}
            className={`rounded-full px-3 py-0.5 text-xs font-semibold transition-colors ${
              rolling
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
            }`}
          >
            {rolling ? '...' : 'Roll'}
          </button>
        </GlowRing>
      </div>
    );
  }

  if (todayRoll) {
    const face = DIE_FACES[todayRoll.result - 1] ?? String(todayRoll.result);
    return (
      <div className="mb-5 flex flex-col items-center gap-2 py-4">
        <span className="text-6xl select-none">{face}</span>
        <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          x{todayRoll.result} Bonus
        </p>
      </div>
    );
  }

  return (
    <div className="mb-5 flex flex-col items-center gap-3 py-4">
      <span className="text-6xl select-none transition-transform duration-75">
        {rolling ? animFace : '🎲'}
      </span>
      <GlowRing active={luckyDiceGlows} className="inline-flex">
        <button
          type="button"
          disabled={rolling}
          onClick={handleRoll}
          className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
            rolling
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }`}
        >
          {rolling ? '...' : 'Roll'}
        </button>
      </GlowRing>
    </div>
  );
}
