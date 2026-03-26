import type { User } from '../types/user';
import type { TaskTemplate, RollInputFields } from '../types/taskTemplate';
import type { Event, QuickActionsEvent } from '../types/event';
import { useScheduleStore } from '../stores/useScheduleStore';
import { STARTER_TEMPLATE_IDS } from '../coach/StarterQuestLibrary';
import { getAppDate, getAppTime } from '../utils/dateUtils';

export const EARLY_BIRD_MULTIPLIER = 1.5;
export const LATE_NIGHT_MULTIPLIER = 1.5;
export const STREAK_DAILY_STEP = 1;

export interface XPAwardContext {
  isWisdomTask?: boolean;
}

export interface RollBoostInfo {
  result: number;
  additiveBonus: number;
  display: string;
}

export interface XPBoostSnapshot {
  earlyBirdActive: boolean;
  lateNightActive: boolean;
  streak: number;
  streakMultiplier: number;
  roll: RollBoostInfo | null;
  timeMultiplier: number;
  finalMultiplier: number;
}

function getAppHour(): number {
  const [hour] = getAppTime().split(':').map(Number);
  return Number.isFinite(hour) ? hour : 0;
}

export function isEarlyBirdActive(): boolean {
  const hour = getAppHour();
  return hour >= 5 && hour <= 9;
}

export function isLateNightActive(): boolean {
  const hour = getAppHour();
  return hour >= 22 || hour < 2;
}

function isQuickActionsEvent(event: Event | QuickActionsEvent): event is QuickActionsEvent {
  return event.eventType === 'quickActions';
}

function findTodayQAEvent(
  activeEvents: Record<string, Event | QuickActionsEvent>,
  historyEvents: Record<string, Event | QuickActionsEvent>,
): QuickActionsEvent | null {
  const today = getAppDate();

  for (const source of [activeEvents, historyEvents]) {
    const byKey = source[`qa-${today}`];
    if (byKey && isQuickActionsEvent(byKey)) return byKey;

    for (const event of Object.values(source)) {
      if (isQuickActionsEvent(event) && event.date === today) {
        return event;
      }
    }
  }

  return null;
}

export function getTodayRollBoost(): RollBoostInfo | null {
  const schedule = useScheduleStore.getState();
  const qaEvent = findTodayQAEvent(schedule.activeEvents, schedule.historyEvents);
  if (!qaEvent) return null;

  for (const completion of qaEvent.completions) {
    const task = schedule.tasks[completion.taskRef];
    if (!task || task.templateRef !== STARTER_TEMPLATE_IDS.roll) continue;

    const fields = task.resultFields as Partial<RollInputFields>;
    const result = fields.result ?? 0;
    if (result <= 0) continue;

    const displayedResult = result + (fields.boostApplied === '+1' ? 1 : 0);
    const additiveBonus = Math.max(0, (displayedResult - 1) * 0.1);
    return {
      result: displayedResult,
      additiveBonus,
      display: `${displayedResult}x`,
    };
  }

  return null;
}

export function isWisdomTemplate(
  template: Pick<TaskTemplate, 'xpAward' | 'secondaryTag'> | null | undefined,
): boolean {
  if (!template) return false;
  return (template.xpAward.wisdom ?? 0) > 0 || template.secondaryTag === 'learning';
}

export function getXPBoostSnapshot(
  user: User | null | undefined,
  context?: XPAwardContext,
): XPBoostSnapshot {
  const earlyBirdActive = isEarlyBirdActive();
  const lateNightActive = isLateNightActive() && Boolean(context?.isWisdomTask);
  const streak = user?.progression.stats.milestones.streakCurrent ?? 0;
  const streakMultiplier = streak > 0 ? 1 + streak * STREAK_DAILY_STEP : 1;
  const roll = getTodayRollBoost();
  const timeMultiplier =
    earlyBirdActive ? EARLY_BIRD_MULTIPLIER : lateNightActive ? LATE_NIGHT_MULTIPLIER : 1;
  const finalMultiplier = timeMultiplier * streakMultiplier + (roll?.additiveBonus ?? 0);

  return {
    earlyBirdActive,
    lateNightActive,
    streak,
    streakMultiplier,
    roll,
    timeMultiplier,
    finalMultiplier,
  };
}

export function calculateAwardedXP(
  baseAmount: number,
  user: User | null | undefined,
  context?: XPAwardContext,
): number {
  if (baseAmount <= 0) return 0;

  const boosts = getXPBoostSnapshot(user, context);
  return Math.max(1, Math.round(baseAmount * boosts.finalMultiplier));
}
