import { v4 as uuidv4 } from 'uuid';
import type {
  Act,
  ActToggle,
  Chain,
  ChainUnlockCondition,
  Marker,
  Quest,
  QuestCompletionState,
  QuestExigency,
  QuestTimely,
  StatGroupKey,
} from '../../../../../types';
import { makeDefaultActToggle, makeDefaultChainUnlockCondition } from '../../../../../types';

export type GoalPage =
  | { type: 'list' }
  | { type: 'act'; actId: string | null }
  | { type: 'chain'; actId: string; chainIdx: number | null }
  | { type: 'quest'; actId: string; chainIdx: number; questIdx: number | null };

export type QuestUnlockMode = 'immediate' | 'previousComplete' | 'manual';

export const STAT_GROUP_OPTIONS: StatGroupKey[] = [
  'health',
  'strength',
  'agility',
  'defense',
  'charisma',
  'wisdom',
];

export function createBlankAct(owner: string): Act {
  return {
    id: uuidv4(),
    name: '',
    description: '',
    icon: 'quest',
    owner,
    habitat: 'habitats',
    chains: [],
    accountability: null,
    commitment: { trackedTaskRefs: [], routineRefs: [] },
    toggle: makeDefaultActToggle(),
    completionState: 'active',
    sharedContacts: null,
  };
}

export function createBlankChain(chainIndex: number): Chain {
  return {
    name: '',
    description: '',
    icon: 'chain',
    wish: '',
    outcome: '',
    obstacle: '',
    plan: {},
    chainReward: '',
    unlockCondition: makeDefaultChainUnlockCondition(chainIndex),
    quests: [],
    adaptiveQuests: [],
    completionState: 'active',
  };
}

export function createBlankQuest(): Quest {
  return {
    name: '',
    description: '',
    icon: 'quest',
    completionState: 'active',
    specific: {
      targetValue: 1,
      unit: null,
      sourceType: 'taskInput',
      resourceRef: null,
      resourceProperty: null,
    },
    measurable: {},
    attainable: {},
    relevant: {},
    timely: {
      conditionType: 'none',
      interval: null,
      xpThreshold: null,
      markers: [],
      projectedFinish: null,
    },
    exigency: { onMissedFinish: 'sleep' },
    result: {},
    milestones: [],
    questReward: '',
    progressPercent: 0,
  };
}

export function getActToggle(act: Act): ActToggle {
  return act.toggle ?? makeDefaultActToggle();
}

export function getChainProgressPercent(chain: Chain): number {
  if (chain.quests.length === 0) return chain.completionState === 'complete' ? 100 : 0;
  const total = chain.quests.reduce((sum, quest) => sum + quest.progressPercent, 0);
  return Math.round(total / chain.quests.length);
}

export function getActActiveChain(act: Act): { chain: Chain | null; index: number } {
  const toggle = getActToggle(act);
  const index = Math.min(Math.max(toggle.activeChainIndex, 0), Math.max(act.chains.length - 1, 0));
  return { chain: act.chains[index] ?? null, index };
}

export function getUnlockConditionLabel(condition?: ChainUnlockCondition): string {
  switch (condition?.type) {
    case 'date':
      return condition.date ? `Unlocks on ${condition.date}` : 'Unlocks on a date';
    case 'manual':
      return 'Manual activation';
    case 'previousComplete':
      return 'After previous chain';
    case 'immediate':
    default:
      return 'Immediate';
  }
}

export function getQuestUnlockMode(quest: Quest): QuestUnlockMode {
  const value = quest.attainable['unlockCondition'];
  return value === 'manual' || value === 'previousComplete' || value === 'immediate'
    ? value
    : 'previousComplete';
}

export function setQuestUnlockMode(quest: Quest, mode: QuestUnlockMode): Quest {
  return {
    ...quest,
    attainable: { ...quest.attainable, unlockCondition: mode },
  };
}

export function createPlaceholderMarker(
  questRef: string,
  taskTemplateRef: string,
  timely: QuestTimely,
  existingMarker?: Marker,
): Marker {
  return {
    questRef,
    conditionType: timely.conditionType,
    triggerSource: existingMarker?.triggerSource ?? 'rollover',
    interval: timely.conditionType === 'interval' ? (timely.interval ?? null) : null,
    xpThreshold: timely.conditionType === 'xpThreshold' ? (timely.xpThreshold ?? null) : null,
    threshold: timely.conditionType === 'taskCount' ? (existingMarker?.threshold ?? 1) : null,
    taskCountScope: timely.conditionType === 'taskCount'
      ? (existingMarker?.taskCountScope ?? {
          type: 'taskTemplateRef',
          ref: taskTemplateRef,
        })
      : null,
    taskTemplateRef,
    lastFired: existingMarker?.lastFired ?? null,
    xpAtLastFire: existingMarker?.xpAtLastFire ?? null,
    taskCountAtLastFire: existingMarker?.taskCountAtLastFire ?? null,
    nextFire: timely.conditionType === 'interval' ? (existingMarker?.nextFire ?? null) : null,
    activeState: existingMarker?.activeState ?? true,
    sideEffects: existingMarker?.sideEffects ?? null,
  };
}

export function normalizeQuestForSave(
  quest: Quest,
  actId: string,
  chainIdx: number,
  questIdx: number,
  taskCountThreshold: number | null = null,
): Quest {
  const taskTemplateRef = quest.measurable.taskTemplateRefs?.[0] ?? quest.timely.markers[0]?.taskTemplateRef ?? '';
  const questRef = `${actId}|${chainIdx}|${questIdx}`;
  const existingMarker = quest.timely.markers[0];

  let timely: QuestTimely = { ...quest.timely };
  if (timely.conditionType === 'none') {
    timely = {
      ...timely,
      interval: null,
      xpThreshold: null,
      markers: [],
    };
  } else {
    const marker = createPlaceholderMarker(questRef, taskTemplateRef, timely, existingMarker);
    if (timely.conditionType === 'taskCount') {
      marker.threshold = taskCountThreshold ?? existingMarker?.threshold ?? 1;
      marker.taskCountScope = {
        type: 'taskTemplateRef',
        ref: taskTemplateRef,
      };
    }
    timely = {
      ...timely,
      markers: taskTemplateRef ? [marker] : timely.markers,
    };
  }

  return {
    ...quest,
    timely,
  };
}

export function normalizeActForSave(act: Act): Act {
  const toggle = getActToggle(act);
  const chainCount = act.chains.length;
  return {
    ...act,
    toggle: {
      ...toggle,
      activeChainIndex: chainCount === 0
        ? 0
        : Math.min(Math.max(toggle.activeChainIndex, 0), chainCount - 1),
    },
    chains: act.chains.map((chain, chainIdx) => ({
      ...chain,
      unlockCondition: chain.unlockCondition ?? makeDefaultChainUnlockCondition(chainIdx),
    })),
  };
}

export function getQuestStateBadgeClass(state: QuestCompletionState): string {
  if (state === 'complete') return 'bg-green-100 text-green-700';
  if (state === 'failed') return 'bg-red-100 text-red-700';
  return 'bg-blue-100 text-blue-700';
}

export function getExigencyLabel(value: QuestExigency['onMissedFinish']): string {
  switch (value) {
    case 'reschedule':
      return 'Set new end date';
    case 'extend':
      return 'Extend interval';
    case 'sleep':
      return 'Go to sleep';
    case 'restart':
    default:
      return 'Do nothing';
  }
}
