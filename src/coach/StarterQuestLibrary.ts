// ─────────────────────────────────────────
// STARTER QUEST LIBRARY — W28 Spec
// All Coach-seeded Acts for first-run content.
// Source of truth: docs/W28_Starter_Quest_Spec.md
//
// Exports:
//   starterQuestLibrary — { acts: Act[], taskTemplates: TaskTemplate[] }
//   seedStarterContent() — writes Acts to progressionStore,
//                          templates to scheduleStore.taskTemplates
//
// Seeding triggered by W30 first-run flow. Export is the handoff point.
// ─────────────────────────────────────────

import type { Act, Chain, Quest, ActCommitment } from '../types/act';
import type { Marker, MarkerConditionType, MarkerTriggerSource } from '../types/quest/Marker';
import type { QuestTimely } from '../types/quest/timely';
import type { QuestSpecific } from '../types/quest/specific';
import type { QuestMeasurable } from '../types/quest/measurable';
import type { QuestExigency } from '../types/quest/exigency';
import type { TaskTemplate, XpAward, TaskSecondaryTag, RecurrenceRule } from '../types/taskTemplate';
import { useProgressionStore } from '../stores/useProgressionStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { taskTemplateLibrary } from '.';
import { localISODate } from '../utils/dateUtils';

// ── STABLE ACT IDs ────────────────────────────────────────────────────────────
// Fixed UUIDs so seeding is idempotent — re-seeding won't duplicate Acts.

export const STARTER_ACT_IDS = {
  onboarding:  'act-onboarding-00000000-0000-0000-0000',
  daily:       'act-daily-00000000-0000-0000-0000-0001',
  health:      'act-health-00000000-0000-0000-0000-0002',
  strength:    'act-strength-00000000-0000-0000-0003',
  agility:     'act-agility-00000000-0000-0000-0004',
  defense:     'act-defense-00000000-0000-0000-0005',
  charisma:    'act-charisma-00000000-0000-0000-0006',
  wisdom:      'act-wisdom-00000000-0000-0000-00007',
} as const;

// ── SYSTEM TASK IDs (internal) ────────────────────────────────────────────────
// Onboarding task templates — seeded by the coach engine, not user-facing.
// Used only within this file to stamp isSystem on seeded templates.
const SYSTEM_TASK_IDS = new Set([
  'tmpl-open-welcome-0000-0000-0000-0001',
  'tmpl-setup-schedule-000-0000-0000-01',
  'tmpl-learn-grounds-000-0000-0000-0001',
  'tmpl-claim-identity-00-0000-0000-0001',
]);

// ── STABLE TASK TEMPLATE IDs ─────────────────────────────────────────────────

export const STARTER_TEMPLATE_IDS = {
  roll:             'tmpl-roll-00000000-0000-0000-0000',
  drinkWater:       'c0ffee01-dead-4bee-f00d-a1b2c3d4e5f6', // existing prebuilt
  logEntry:         'tmpl-log-entry-0000-0000-0000-0001',
  openWelcomeEvent: 'tmpl-open-welcome-0000-0000-0000-0001',
  setupSchedule:    'tmpl-setup-schedule-000-0000-0000-01',
  learnGrounds:     'tmpl-learn-grounds-000-0000-0000-0001',
  claimIdentity:    'tmpl-claim-identity-00-0000-0000-0001',
  bodyLog:          'tmpl-body-log-000000-0000-0000-0000-01',
  mealLog:          'tmpl-meal-log-000000-0000-0000-0000-01',
  loginCheck:       'tmpl-login-check-0000-0000-0000-0001',
  sleepCircuit:     'tmpl-sleep-circuit-00-0000-0000-0000',
  walkRoute:        'b4c5d6e7-f8a9-4012-9890-123456789012', // existing prebuilt
  workoutCheck:     'tmpl-workout-check-00-0000-0000-0001',
  workoutCounter:   'tmpl-workout-counter-0-0000-0000-0001',
  chore:            'tmpl-chore-00000000-0000-0000-0000-01',
  clearInbox:       'tmpl-clear-inbox-0000-0000-0000-0001',
  logTransaction:   'tmpl-log-transaction-0-0000-0000-0001',
  inventoryCounter: 'tmpl-inventory-count-0-0000-0000-0001',
  selfCompliment:   'tmpl-self-compliment-0-0000-0000-0001',
  gratitude:        'tmpl-gratitude-000000-0000-0000-0000-1',
  kindness:         'tmpl-kindness-000000-0000-0000-0000-01',
  sharedActivity:   'tmpl-shared-activity-0-0000-0000-0001',
  meditation:       'e5f6a7b8-c9d0-4123-af01-234567890123', // existing prebuilt
  moodLog:          'tmpl-mood-log-000000-0000-0000-0000-01',
  formTask:         'b8c9d0e1-f2a3-4456-b234-567890123456', // existing weekly review
  wisdomCheck:      'tmpl-wisdom-check-000-0000-0000-0001',
} as const;

// ── HELPERS ───────────────────────────────────────────────────────────────────

const DAILY_RULE: RecurrenceRule = {
  frequency: 'daily',
  days: [],
  interval: 1,
  endsOn: null,
  customCondition: null,
};

function makeIntervalMarker(
  questRef: string,
  templateRef: string,
  nextFire: string | null = null,
): Marker {
  return {
    questRef,
    conditionType: 'interval',
    triggerSource: 'rollover',
    interval: DAILY_RULE,
    xpThreshold: null,
    threshold: null,
    taskCountScope: null,
    taskTemplateRef: templateRef,
    lastFired: null,
    xpAtLastFire: null,
    taskCountAtLastFire: null,
    nextFire,
    activeState: true,
    sideEffects: null,
  };
}

function makeTaskCountMarker(
  questRef: string,
  templateRef: string,
  threshold: number,
  scopeType: 'taskTemplateRef' | 'statGroup' | 'systemEvent',
  scopeRef: string,
  triggerSource: MarkerTriggerSource = 'rollover',
): Marker {
  return {
    questRef,
    conditionType: 'taskCount',
    triggerSource,
    interval: null,
    xpThreshold: null,
    threshold,
    taskCountScope: { type: scopeType, ref: scopeRef },
    taskTemplateRef: templateRef,
    lastFired: null,
    xpAtLastFire: null,
    taskCountAtLastFire: null,
    nextFire: null,
    activeState: true,
    sideEffects: null,
  };
}

function makeTimely(marker: Marker, conditionType: MarkerConditionType = 'interval'): QuestTimely {
  return {
    conditionType,
    interval: conditionType === 'interval' ? DAILY_RULE : null,
    xpThreshold: null,
    markers: [marker],
    projectedFinish: null,
  };
}

const EMPTY_COMMITMENT: ActCommitment = {
  trackedTaskRefs: [],
  routineRefs: [],
};

function xp(primary: keyof XpAward, amount: number): XpAward {
  const base: XpAward = { health: 0, strength: 0, agility: 0, defense: 0, charisma: 0, wisdom: 0 };
  base[primary] = amount;
  return base;
}

// ── STARTER TASK TEMPLATES ────────────────────────────────────────────────────
// Only templates NOT already present in TaskTemplateLibrary.json.
// Prebuilt IDs (drinkWater, walkRoute, meditation, formTask) are referenced
// via STARTER_TEMPLATE_IDS but NOT re-declared here — they already exist.

export const starterTaskTemplates: TaskTemplate[] = [
  // ROLL — D78 daily dice roll
  {
    id: STARTER_TEMPLATE_IDS.roll,
    name: 'Lucky Dice',
    description: 'Roll the dice for today\'s XP boost. One roll per day — result locked on complete.',
    icon: 'roll',
    taskType: 'ROLL',
    inputFields: { sides: 6 },
    xpAward: xp('agility', 0), // XP multiplier applied at roll time
    secondaryTag: 'fitness' as TaskSecondaryTag,
    cooldown: 1440,
    media: null,
    items: [],
  },
  // LOG — generic log entry
  {
    id: STARTER_TEMPLATE_IDS.logEntry,
    name: 'Log something',
    description: 'Write a free-form note to any active Doc.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'What would you like to log?' },
    xpAward: xp('wisdom', 15),
    secondaryTag: 'mindfulness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  // ONBOARDING TASKS — isSystem: true hides them from all user-facing pickers
  {
    id: STARTER_TEMPLATE_IDS.openWelcomeEvent,
    isSystem: true,
    name: 'Open the Welcome Event',
    description: 'Tap the Welcome Event to begin your first quest.',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Open the Welcome Event' },
    xpAward: xp('health', 25),
    secondaryTag: null,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.setupSchedule,
    isSystem: true,
    name: 'Set Up Your Schedule',
    description: 'Explore prebuilts, add a default routine, and switch between time views.',
    icon: 'checklist',
    taskType: 'CHECKLIST',
    inputFields: {
      items: [
        { key: 'add_routine', label: 'Add a default routine from prebuilts' },
        { key: 'week_view', label: 'Switch to Week view' },
        { key: 'month_view', label: 'Switch to Month view' },
      ],
    },
    xpAward: xp('wisdom', 40),
    secondaryTag: 'admin' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.learnGrounds,
    isSystem: true,
    name: 'Learn the Grounds',
    description: 'Explore resources, add a favourite task, and complete the GTD task from Quest 1.',
    icon: 'checklist',
    taskType: 'CHECKLIST',
    inputFields: {
      items: [
        { key: 'add_fav', label: 'Add Drink Water as a favourite task' },
        { key: 'open_resources', label: 'Open each Resource room' },
        { key: 'open_task_room', label: 'Open the Task room' },
        { key: 'open_schedule_room', label: 'Open the Schedule room' },
        { key: 'complete_gtd', label: 'Complete the GTD task from Quest 1' },
      ],
    },
    xpAward: xp('defense', 40),
    secondaryTag: 'admin' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.claimIdentity,
    isSystem: true,
    name: 'Claim Your Identity',
    description: 'Set your display name and establish your presence in the pond.',
    icon: 'form',
    taskType: 'FORM',
    inputFields: {
      fields: [
        { key: 'display_name', label: 'Display name', fieldType: 'text' },
      ],
    },
    xpAward: xp('charisma', 40),
    secondaryTag: 'social' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  // STAT PATH TASKS
  {
    id: STARTER_TEMPLATE_IDS.bodyLog,
    name: 'Log body scan',
    description: 'Record a quick body scan noting sensations, tension, or energy levels.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'Body scan — what are you noticing right now?' },
    xpAward: xp('health', 20),
    secondaryTag: 'health' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.mealLog,
    name: 'Log meal',
    description: 'Log what you ate for a meal — notes on ingredients, quantity, or how it felt.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'What did you eat? Any notes?' },
    xpAward: xp('health', 20),
    secondaryTag: 'nutrition' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.loginCheck,
    name: 'Daily login',
    description: 'Simply open the app — the system logs your visit automatically.',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Logged in today' },
    xpAward: xp('health', 10),
    secondaryTag: 'health' as TaskSecondaryTag,
    cooldown: 720,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.sleepCircuit,
    name: 'Track sleep',
    description: 'Log when you went to sleep, when you woke up, and how rested you feel.',
    icon: 'circuit',
    taskType: 'CIRCUIT',
    inputFields: {
      exercises: ['Log sleep time', 'Log wake time', 'Rate restedness (1–5)'],
      rounds: 1,
      restBetweenRounds: null,
    },
    xpAward: xp('strength', 30),
    secondaryTag: 'health' as TaskSecondaryTag,
    cooldown: 720,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.workoutCheck,
    name: 'Complete workout event',
    description: 'Mark a workout event as complete.',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Workout complete' },
    xpAward: xp('strength', 40),
    secondaryTag: 'fitness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.workoutCounter,
    name: 'Log workout count',
    description: 'Increment your cumulative workout log.',
    icon: 'counter',
    taskType: 'COUNTER',
    inputFields: { target: 24, unit: 'workouts', step: 1 },
    xpAward: xp('strength', 30),
    secondaryTag: 'fitness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.chore,
    name: 'Chore',
    description: 'Complete a household chore task.',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Chore complete' },
    xpAward: xp('agility', 20),
    secondaryTag: 'home' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.clearInbox,
    name: 'Clear inbox',
    description: 'Work through your inbox or GTD list until it\'s empty.',
    icon: 'checklist',
    taskType: 'CHECKLIST',
    inputFields: {
      items: [
        { key: 'process_email', label: 'Process email inbox' },
        { key: 'process_gtd', label: 'Triage GTD list' },
        { key: 'capture_actions', label: 'Capture next actions' },
      ],
    },
    xpAward: xp('agility', 30),
    secondaryTag: 'admin' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.logTransaction,
    name: 'Log transaction',
    description: 'Record a financial transaction to your account doc.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'Transaction details — amount, category, notes', unit: '$' },
    xpAward: xp('defense', 25),
    secondaryTag: 'finance' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.inventoryCounter,
    name: 'Inventory items',
    description: 'Log or count items in your personal inventory.',
    icon: 'counter',
    taskType: 'COUNTER',
    inputFields: { target: 24, unit: 'items', step: 1 },
    xpAward: xp('defense', 20),
    secondaryTag: 'admin' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.selfCompliment,
    name: 'Log a self compliment',
    description: 'Take a moment to recognise something you did well today.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'What did you do well today?' },
    xpAward: xp('charisma', 25),
    secondaryTag: 'mindfulness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.gratitude,
    name: 'Log a piece of gratitude',
    description: 'Write down one thing you\'re grateful for right now.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'What are you grateful for today?' },
    xpAward: xp('charisma', 25),
    secondaryTag: 'mindfulness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.kindness,
    name: 'Log an act of kindness',
    description: 'Record something kind you did for someone else.',
    icon: 'log',
    taskType: 'LOG',
    inputFields: { prompt: 'What act of kindness did you perform?' },
    xpAward: xp('charisma', 25),
    secondaryTag: 'social' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.sharedActivity,
    name: 'Shared activity',
    description: 'Log a social or shared activity with someone else. [MULTI-USER stub]',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Shared activity complete' },
    xpAward: xp('charisma', 30),
    secondaryTag: 'social' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.moodLog,
    name: 'Log mood',
    description: 'Rate and note your current mood state.',
    icon: 'rating',
    taskType: 'RATING',
    inputFields: { scale: 10, label: 'Mood (1 = very low, 10 = great)' },
    xpAward: xp('wisdom', 20),
    secondaryTag: 'mindfulness' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
  {
    id: STARTER_TEMPLATE_IDS.wisdomCheck,
    name: 'Wisdom task',
    description: 'Complete any wisdom-tagged task — study, reflection, or planning.',
    icon: 'check',
    taskType: 'CHECK',
    inputFields: { label: 'Wisdom task complete' },
    xpAward: xp('wisdom', 25),
    secondaryTag: 'learning' as TaskSecondaryTag,
    cooldown: null,
    media: null,
    items: [],
  },
];

// ── QUEST FACTORY HELPERS ─────────────────────────────────────────────────────

const DEFAULT_EXIGENCY: QuestExigency = { onMissedFinish: 'sleep' };

function makeQuest(
  name: string,
  description: string,
  timely: QuestTimely,
  measurable: QuestMeasurable,
  specific: QuestSpecific,
  questReward: string,
): Quest {
  return {
    name,
    description,
    icon: 'quest',
    completionState: 'active',
    specific,
    measurable,
    attainable: {},
    relevant: {},
    timely,
    exigency: DEFAULT_EXIGENCY,
    result: {},
    milestones: [],
    questReward,
    progressPercent: 0,
  };
}

function taskInputSpecific(targetValue: number, unit: string | null = null): QuestSpecific {
  return {
    targetValue,
    unit,
    sourceType: 'taskInput',
    resourceRef: null,
    resourceProperty: null,
  };
}

// ── ACT 1 — ONBOARDING ADVENTURE ─────────────────────────────────────────────

const OB_ACT_ID = STARTER_ACT_IDS.onboarding;

// Quest 1 — Ripple
const q1Marker: Marker = {
  questRef: `${OB_ACT_ID}|0|0`,
  conditionType: 'interval',
  triggerSource: 'rollover',
  interval: DAILY_RULE,
  xpThreshold: null,
  threshold: null,
  taskCountScope: null,
  taskTemplateRef: STARTER_TEMPLATE_IDS.openWelcomeEvent,
  lastFired: null,
  xpAtLastFire: null,
  taskCountAtLastFire: null,
  nextFire: localISODate(new Date()),
  activeState: true,
  // D81 sideEffect: drop a GTD item after Q1 fires so user must complete it in Q3
  sideEffects: [
    {
      type: 'gtdWrite',
      taskTemplateRef: STARTER_TEMPLATE_IDS.learnGrounds,
      note: 'Complete this in Quest 3 — Learn the Grounds',
    },
  ],
};

const q1: Quest = makeQuest(
  'Ripple',
  'Open the Welcome Event and complete the task inside it to make your first ripple.',
  {
    conditionType: 'interval',
    interval: DAILY_RULE,
    xpThreshold: null,
    markers: [q1Marker],
    projectedFinish: null,
  },
  { taskTypes: ['CHECK'] },
  taskInputSpecific(1),
  'xp-light',
);

// Quest 2 — Splash
const q2Marker = makeIntervalMarker(`${OB_ACT_ID}|0|1`, STARTER_TEMPLATE_IDS.setupSchedule);
const q2: Quest = makeQuest(
  'Splash',
  'Set up your schedule, explore prebuilt routines, and switch between time views.',
  makeTimely(q2Marker),
  { taskTypes: ['CHECKLIST'] },
  taskInputSpecific(3),
  'xp-standard',
);

// Quest 3 — High Ground
const q3Marker = makeIntervalMarker(`${OB_ACT_ID}|0|2`, STARTER_TEMPLATE_IDS.learnGrounds);
const q3: Quest = makeQuest(
  'High Ground',
  'Explore the app, add Drink Water as a favourite, visit each Resource room, and complete the GTD task from Quest 1.',
  makeTimely(q3Marker),
  { taskTypes: ['CHECKLIST'] },
  taskInputSpecific(5),
  'xp-standard',
);

// Quest 4 — Stake Your Claim
const q4Marker = makeIntervalMarker(`${OB_ACT_ID}|0|3`, STARTER_TEMPLATE_IDS.claimIdentity);
const q4: Quest = makeQuest(
  'Stake Your Claim',
  'Set your display name, place your first badge, equip gear, and open the Adventures tab to complete onboarding.',
  makeTimely(q4Marker),
  { taskTypes: ['FORM'] },
  taskInputSpecific(1),
  'xp-standard',
);

const onboardingChain: Chain = {
  name: 'Welcome to CAN-DO-BE',
  description: 'Four quests that walk you through the core system.',
  icon: 'chain',
  wish: 'Build a life worth levelling up',
  outcome: 'A fully configured system that works with your real life',
  obstacle: 'Skipping setup means missing the loop',
  plan: {},
  chainReward: 'xp-chain-onboarding',
  quests: [q1, q2, q3, q4],
  completionState: 'active',
};

export const onboardingAct: Act = {
  id: OB_ACT_ID,
  name: 'Onboarding Adventure',
  description: 'Your first chapter. Complete four quests to set up your system and step into the pond.',
  icon: 'act-onboarding',
  owner: 'coach',
  habitat: 'adventures',
  chains: [onboardingChain],
  accountability: null,
  commitment: EMPTY_COMMITMENT,
  toggle: {},
  completionState: 'active',
  sharedContacts: null,
};

// ── ACT 2 — DAILY ADVENTURE ───────────────────────────────────────────────────
// D79: Transforms from Onboarding Act on completion — same Act object, relabelled.
// Chain 0 (Onboarding) stays in history. Rollover appends a new Chain each day.
// This is the template for the daily Chain structure only.

const DA_ACT_ID = STARTER_ACT_IDS.daily;

function makeDailyRollQuest(actId: string, chainIdx: number): Quest {
  const marker = makeIntervalMarker(`${actId}|${chainIdx}|0`, STARTER_TEMPLATE_IDS.roll);
  return makeQuest(
    'Daily Roll',
    'Roll the Lucky Dice in Quick Actions for today\'s XP boost.',
    makeTimely(marker),
    { taskTypes: ['ROLL'] },
    taskInputSpecific(1),
    'xp-roll',
  );
}

function makeDailyWaterQuest(actId: string, chainIdx: number): Quest {
  const marker = makeIntervalMarker(`${actId}|${chainIdx}|1`, STARTER_TEMPLATE_IDS.drinkWater);
  return makeQuest(
    'Daily Water',
    'Complete 3 Drink Water tasks across the day.',
    makeTimely(marker),
    { taskTypes: ['CHECK'] },
    taskInputSpecific(1),
    'xp-water',
  );
}

function makeDailyLogQuest(actId: string, chainIdx: number): Quest {
  const marker = makeIntervalMarker(`${actId}|${chainIdx}|2`, STARTER_TEMPLATE_IDS.logEntry);
  return makeQuest(
    'Log Something',
    'Write at least one Doc entry today.',
    makeTimely(marker),
    { taskTypes: ['LOG'] },
    taskInputSpecific(1),
    'xp-log',
  );
}

function makeDailyClearDeckQuest(actId: string, chainIdx: number): Quest {
  const marker = makeIntervalMarker(`${actId}|${chainIdx}|3`, STARTER_TEMPLATE_IDS.openWelcomeEvent);
  return makeQuest(
    'Clear the Deck',
    'Complete all scheduled events by the end of the day.',
    makeTimely(marker),
    { taskTypes: ['CHECK'] },
    taskInputSpecific(1),
    'xp-clear-deck',
  );
}

/** Build a single daily Chain (Chain 1 = first post-onboarding day, etc.) */
export function makeDailyChain(actId: string, chainIdx: number, date: string): Chain {
  return {
    name: `Day ${chainIdx} — ${date}`,
    description: 'Four daily quests. Complete them before midnight.',
    icon: 'chain-daily',
    wish: 'Show up every day',
    outcome: 'A streak of consistent daily action',
    obstacle: 'Getting distracted or forgetting to check in',
    plan: {},
    chainReward: 'xp-daily-chain',
    quests: [
      makeDailyRollQuest(actId, chainIdx),
      makeDailyWaterQuest(actId, chainIdx),
      makeDailyLogQuest(actId, chainIdx),
      makeDailyClearDeckQuest(actId, chainIdx),
    ],
    adaptiveQuests: [],
    completionState: 'active',
  };
}

export const dailyAct: Act = {
  id: DA_ACT_ID,
  name: 'Daily Adventure',
  description: 'A new chain each day. Roll, hydrate, log, and clear the deck.',
  icon: 'act-daily',
  owner: 'coach',
  habitat: 'adventures',
  chains: [], // populated at onboarding completion and daily rollover
  accountability: null,
  commitment: EMPTY_COMMITMENT,
  toggle: {},
  completionState: 'active',
  sharedContacts: null,
};

// ── STAT PATH ACTS ────────────────────────────────────────────────────────────
// One Chain per Act, four Quests, taskCount Markers with thresholds 3/6/12/24.

function makeStatPathAct(
  id: string,
  name: string,
  description: string,
  quests: Quest[],
): Act {
  const chain: Chain = {
    name: `${name} — Chain 1`,
    description: `Four progressive quests building your ${name.toLowerCase().replace(' path', '')} stat.`,
    icon: 'chain-stat',
    wish: `Build consistent ${name.toLowerCase().replace(' path', '')} habits`,
    outcome: `Measurable improvement in ${name.toLowerCase().replace(' path', '')} over 24 sessions`,
    obstacle: 'Inconsistency and skipping sessions',
    plan: {},
    chainReward: `xp-chain-${id.slice(4, 14)}`,
    quests,
    completionState: 'active',
  };

  return {
    id,
    name,
    description,
    icon: `act-${id.split('-')[1]}`,
    owner: 'coach',
    habitat: 'adventures',
    chains: [chain],
    accountability: null,
    commitment: EMPTY_COMMITMENT,
    toggle: {},
    completionState: 'active',
    sharedContacts: null,
  };
}

// Health Path
const HP_ID = STARTER_ACT_IDS.health;
const healthAct = makeStatPathAct(
  HP_ID,
  'Health Path',
  'Track your body, hydration, meals, and daily presence.',
  [
    makeQuest('H1 — Body Scan',
      'Log 3 body scans to tune into your physical state.',
      makeTimely(makeTaskCountMarker(`${HP_ID}|0|0`, STARTER_TEMPLATE_IDS.bodyLog, 3, 'taskTemplateRef', STARTER_TEMPLATE_IDS.bodyLog), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-h1'),
    makeQuest('H2 — Hydration',
      'Complete the Daily Water quest 6 times.',
      makeTimely(makeTaskCountMarker(`${HP_ID}|0|1`, STARTER_TEMPLATE_IDS.drinkWater, 6, 'taskTemplateRef', STARTER_TEMPLATE_IDS.drinkWater), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-h2'),
    makeQuest('H3 — Meal Log',
      'Log 12 meals across your history.',
      makeTimely(makeTaskCountMarker(`${HP_ID}|0|2`, STARTER_TEMPLATE_IDS.mealLog, 12, 'taskTemplateRef', STARTER_TEMPLATE_IDS.mealLog), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-h3'),
    makeQuest('H4 — Daily Presence',
      'Log in 24 times — one per day.',
      makeTimely(makeTaskCountMarker(`${HP_ID}|0|3`, STARTER_TEMPLATE_IDS.loginCheck, 24, 'systemEvent', 'login'), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-h4'),
  ],
);

// Strength Path
const SP_ID = STARTER_ACT_IDS.strength;
const strengthAct = makeStatPathAct(
  SP_ID,
  'Strength Path',
  'Sleep, move, train, and log your physical output.',
  [
    makeQuest('S1 — Sleep',
      'Track your sleep 3 times.',
      makeTimely(makeTaskCountMarker(`${SP_ID}|0|0`, STARTER_TEMPLATE_IDS.sleepCircuit, 3, 'taskTemplateRef', STARTER_TEMPLATE_IDS.sleepCircuit), 'taskCount'),
      { taskTypes: ['CIRCUIT'] }, taskInputSpecific(1), 'xp-s1'),
    makeQuest('S2 — Walk Route',
      'Complete 6 walk route sessions.',
      makeTimely(makeTaskCountMarker(`${SP_ID}|0|1`, STARTER_TEMPLATE_IDS.walkRoute, 6, 'taskTemplateRef', STARTER_TEMPLATE_IDS.walkRoute), 'taskCount'),
      { taskTypes: ['LOCATION_TRAIL'] }, taskInputSpecific(1), 'xp-s2'),
    makeQuest('S3 — Workout Events',
      'Complete 12 workout events.',
      makeTimely(makeTaskCountMarker(`${SP_ID}|0|2`, STARTER_TEMPLATE_IDS.workoutCheck, 12, 'taskTemplateRef', STARTER_TEMPLATE_IDS.workoutCheck), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-s3'),
    makeQuest('S4 — Workout Log',
      'Log 24 workout sessions cumulatively.',
      makeTimely(makeTaskCountMarker(`${SP_ID}|0|3`, STARTER_TEMPLATE_IDS.workoutCounter, 24, 'taskTemplateRef', STARTER_TEMPLATE_IDS.workoutCounter), 'taskCount'),
      { taskTypes: ['COUNTER'] }, taskInputSpecific(1), 'xp-s4'),
  ],
);

// Agility Path
const AG_ID = STARTER_ACT_IDS.agility;
const agilityAct = makeStatPathAct(
  AG_ID,
  'Agility Path',
  'Maintain your home, clear your inbox, and master your events.',
  [
    makeQuest('A1 — Chores',
      'Complete 3 chore tasks.',
      makeTimely(makeTaskCountMarker(`${AG_ID}|0|0`, STARTER_TEMPLATE_IDS.chore, 3, 'taskTemplateRef', STARTER_TEMPLATE_IDS.chore), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-a1'),
    makeQuest('A2 — Clear Inbox',
      'Clear your inbox 6 times.',
      makeTimely(makeTaskCountMarker(`${AG_ID}|0|1`, STARTER_TEMPLATE_IDS.clearInbox, 6, 'taskTemplateRef', STARTER_TEMPLATE_IDS.clearInbox), 'taskCount'),
      { taskTypes: ['CHECKLIST'] }, taskInputSpecific(1), 'xp-a2'),
    makeQuest('A3 — Event Completions',
      'Complete 12 events of any type.',
      makeTimely(makeTaskCountMarker(`${AG_ID}|0|2`, STARTER_TEMPLATE_IDS.openWelcomeEvent, 12, 'systemEvent', 'event.completed'), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-a3'),
    makeQuest('A4 — Quick Actions',
      'Complete 24 Quick Action tasks.',
      makeTimely(makeTaskCountMarker(`${AG_ID}|0|3`, STARTER_TEMPLATE_IDS.openWelcomeEvent, 24, 'systemEvent', 'quickAction.completed'), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-a4'),
  ],
);

// Defense Path
const DF_ID = STARTER_ACT_IDS.defense;
const defenseAct = makeStatPathAct(
  DF_ID,
  'Defense Path',
  'Schedule intentionally, clear your day, log finances, and track inventory.',
  [
    makeQuest('DF1 — Schedule',
      'Create 3 one-time events.',
      makeTimely(makeTaskCountMarker(`${DF_ID}|0|0`, STARTER_TEMPLATE_IDS.openWelcomeEvent, 3, 'systemEvent', 'plannedEvent.created', 'plannedEvent.created'), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-df1'),
    makeQuest('DF2 — Clear the Deck',
      'Complete all scheduled events on 6 different days.',
      makeTimely(makeTaskCountMarker(`${DF_ID}|0|1`, STARTER_TEMPLATE_IDS.openWelcomeEvent, 6, 'systemEvent', 'clearDeck.completed'), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-df2'),
    makeQuest('DF3 — Log Transactions',
      'Log 12 financial transactions.',
      makeTimely(makeTaskCountMarker(`${DF_ID}|0|2`, STARTER_TEMPLATE_IDS.logTransaction, 12, 'taskTemplateRef', STARTER_TEMPLATE_IDS.logTransaction), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-df3'),
    makeQuest('DF4 — Inventory',
      'Log 24 inventory items.',
      makeTimely(makeTaskCountMarker(`${DF_ID}|0|3`, STARTER_TEMPLATE_IDS.inventoryCounter, 24, 'taskTemplateRef', STARTER_TEMPLATE_IDS.inventoryCounter), 'taskCount'),
      { taskTypes: ['COUNTER'] }, taskInputSpecific(1), 'xp-df4'),
  ],
);

// Charisma Path
const CH_ID = STARTER_ACT_IDS.charisma;
const charismaAct = makeStatPathAct(
  CH_ID,
  'Charisma Path',
  'Build self-awareness, gratitude, kindness, and social connection.',
  [
    makeQuest('C1 — Self Compliment',
      'Log 3 self compliments.',
      makeTimely(makeTaskCountMarker(`${CH_ID}|0|0`, STARTER_TEMPLATE_IDS.selfCompliment, 3, 'taskTemplateRef', STARTER_TEMPLATE_IDS.selfCompliment), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-c1'),
    makeQuest('C2 — Gratitude',
      'Log 6 pieces of gratitude.',
      makeTimely(makeTaskCountMarker(`${CH_ID}|0|1`, STARTER_TEMPLATE_IDS.gratitude, 6, 'taskTemplateRef', STARTER_TEMPLATE_IDS.gratitude), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-c2'),
    makeQuest('C3 — Acts of Kindness',
      'Log 12 acts of kindness.',
      makeTimely(makeTaskCountMarker(`${CH_ID}|0|2`, STARTER_TEMPLATE_IDS.kindness, 12, 'taskTemplateRef', STARTER_TEMPLATE_IDS.kindness), 'taskCount'),
      { taskTypes: ['LOG'] }, taskInputSpecific(1), 'xp-c3'),
    makeQuest('C4 — Shared Activity',
      'Complete 24 shared activities. [MULTI-USER stub]',
      makeTimely(makeTaskCountMarker(`${CH_ID}|0|3`, STARTER_TEMPLATE_IDS.sharedActivity, 24, 'taskTemplateRef', STARTER_TEMPLATE_IDS.sharedActivity), 'taskCount'),
      { taskTypes: ['CHECK'] }, taskInputSpecific(1), 'xp-c4'),
  ],
);

// Wisdom Path
const WS_ID = STARTER_ACT_IDS.wisdom;
const wisdomAct = makeStatPathAct(
  WS_ID,
  'Wisdom Path',
  'Meditate, track mood, complete form tasks, and build wisdom habits.',
  [
    makeQuest('W1 — Meditation',
      'Complete 3 meditation sessions.',
      makeTimely(makeTaskCountMarker(`${WS_ID}|0|0`, STARTER_TEMPLATE_IDS.meditation, 3, 'taskTemplateRef', STARTER_TEMPLATE_IDS.meditation), 'taskCount'),
      { taskTypes: ['TIMER'] }, taskInputSpecific(1), 'xp-w1'),
    makeQuest('W2 — Mood Log',
      'Log your mood 6 times.',
      makeTimely(makeTaskCountMarker(`${WS_ID}|0|1`, STARTER_TEMPLATE_IDS.moodLog, 6, 'taskTemplateRef', STARTER_TEMPLATE_IDS.moodLog), 'taskCount'),
      { taskTypes: ['RATING'] }, taskInputSpecific(1), 'xp-w2'),
    makeQuest('W3 — Form Tasks',
      'Complete 12 form-type tasks.',
      makeTimely(makeTaskCountMarker(`${WS_ID}|0|2`, STARTER_TEMPLATE_IDS.formTask, 12, 'taskTemplateRef', STARTER_TEMPLATE_IDS.formTask), 'taskCount'),
      { taskTypes: ['FORM'] }, taskInputSpecific(1), 'xp-w3'),
    makeQuest('W4 — Wisdom Habits',
      'Complete 24 wisdom-tagged tasks of any kind.',
      makeTimely(makeTaskCountMarker(`${WS_ID}|0|3`, STARTER_TEMPLATE_IDS.wisdomCheck, 24, 'statGroup', 'wisdom'), 'taskCount'),
      { taskTypes: ['CHECK', 'TIMER', 'FORM', 'RATING', 'LOG', 'TEXT'] }, taskInputSpecific(1), 'xp-w4'),
  ],
);

// ── SPLIT ACT EXPORTS (D87) ───────────────────────────────────────────────────

/** Acts seeded on first run — Onboarding only (D87). */
export const starterActs: Act[] = [onboardingAct];

/** Acts held in the coach bundle until triggered by game events (D87). */
export const coachActs: Act[] = [
  dailyAct,
  healthAct,
  strengthAct,
  agilityAct,
  defenseAct,
  charismaAct,
  wisdomAct,
];

// ── LIBRARY EXPORT ────────────────────────────────────────────────────────────

export const starterQuestLibrary = {
  /** All starter acts — used by test utilities that need the full set. */
  acts: [...starterActs, ...coachActs] as Act[],
  taskTemplates: starterTaskTemplates,
};

// ── STARTER TEMPLATE SET (D88) ───────────────────────────────────────────────

/**
 * Coach's day-one template push — the templates seeded into scheduleStore
 * on first run so the Task Room is populated immediately.
 *
 * Includes:
 *   - All Onboarding quest Marker taskTemplateRefs
 *   - Curated Daily / lifestyle picks
 */
export const starterTaskTemplateIds: string[] = [
  // Onboarding quest markers
  STARTER_TEMPLATE_IDS.openWelcomeEvent,
  STARTER_TEMPLATE_IDS.setupSchedule,
  STARTER_TEMPLATE_IDS.learnGrounds,
  STARTER_TEMPLATE_IDS.claimIdentity,
  // Coach curated day-one picks
  STARTER_TEMPLATE_IDS.drinkWater,
  STARTER_TEMPLATE_IDS.meditation,
  STARTER_TEMPLATE_IDS.logEntry,
  STARTER_TEMPLATE_IDS.moodLog,
  STARTER_TEMPLATE_IDS.walkRoute,
  STARTER_TEMPLATE_IDS.chore,
  STARTER_TEMPLATE_IDS.clearInbox,
  STARTER_TEMPLATE_IDS.bodyLog,
  STARTER_TEMPLATE_IDS.mealLog,
];

/**
 * Seed the coach's starter template set into scheduleStore.taskTemplates.
 * Merges taskTemplateLibrary (prebuilts) + starterTaskTemplates (quest-specific),
 * then writes only IDs in starterTaskTemplateIds.
 * Idempotent — setTaskTemplate is a simple upsert.
 */
export function seedStarterTemplates(): void {
  const scheduleStore = useScheduleStore.getState();
  const idSet = new Set(starterTaskTemplateIds);

  // Build lookup from both sources; library wins on duplicates
  const allTemplates = new Map<string, TaskTemplate>();
  for (const t of starterTaskTemplates) {
    if (t.id) allTemplates.set(t.id, t);
  }
  for (const t of taskTemplateLibrary) {
    if (t.id) allTemplates.set(t.id, t);
  }

  for (const [id, template] of allTemplates) {
    if (idSet.has(id)) {
      scheduleStore.setTaskTemplate(id, {
        ...template,
        isCustom: false,
        isSystem: SYSTEM_TASK_IDS.has(id),
      });
    }
  }
}

// ── SEED FUNCTION ─────────────────────────────────────────────────────────────

/**
 * Write the Onboarding Act and all starter TaskTemplates to their stores.
 * Idempotent — skips items already present when skipExisting is true (default).
 *
 * Per D87: only starterActs (Onboarding) is seeded here.
 * Other Acts (Daily, stat paths) unlock via unlockAct() when triggered.
 */
export function seedStarterContent(skipExisting = true): void {
  const progressionStore = useProgressionStore.getState();

  // Seed Acts — Onboarding only (D87)
  for (const act of starterActs) {
    if (skipExisting && progressionStore.acts[act.id]) continue;
    progressionStore.setAct(act);
  }
}

// ── UNLOCK ACT (D87) ──────────────────────────────────────────────────────────

/**
 * Unlock a coach bundle Act and add it to progressionStore.
 * Called when game events trigger an Act to become available (D87).
 *
 * @param actId  One of STARTER_ACT_IDS values for a coach bundle act
 */
export function unlockAct(actId: string): void {
  const act = coachActs.find((a) => a.id === actId);
  if (!act) return;
  useProgressionStore.getState().setAct(act);
}
