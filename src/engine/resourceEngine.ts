// ─────────────────────────────────────────
// RESOURCE ENGINE — Resource-generates-task pattern (D42)
//
// Each resource type (except Doc) generates tasks via two paths:
//   1. generateScheduledTasks() — PlannedEvents written to scheduleStore + storage
//   2. generateGTDItems()       — Tasks written directly to gtdList
//
// computeGTDList() — scans all active resources, merges deduped GTD items
// completeGTDItem() — marks item done, writes to QuickActionsEvent, fires coach
//
// Doc generates tasks via course progression — stub only (deferred BUILD-time task).
//
// Resource context tasks award +2 defense bonus per D39 (Task.resourceRef set).
// ─────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { Resource, ContactMeta, AccountMeta, InventoryMeta } from '../types/resource';
import type { PlannedEvent } from '../types/plannedEvent';
import type { Task } from '../types/task';
import type { TaskTemplate } from '../types/taskTemplate';
import type { User } from '../types/user';
import type { QuickActionsEvent } from '../types/event';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useUserStore } from '../stores/useUserStore';
import { useResourceStore } from '../stores/useResourceStore';
import { storageSet, storageKey } from '../storage';
import { awardXP, awardStat } from './awardPipeline';
import { checkAchievements } from '../coach/checkAchievements';
import { awardBadge } from '../coach/rewardPipeline';
import { pushRibbet } from '../coach/ribbet';

// ── HELPERS ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Days until an upcoming date (same year or next year for annual events).
 * Returns null if date is not parseable.
 */
function daysUntilAnnual(isoDate: string): number | null {
  const today = new Date(todayISO() + 'T00:00:00');
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length < 3) return null;
  const thisYear = today.getFullYear();
  const candidate = new Date(`${thisYear}-${parts[1]}-${parts[2]}T00:00:00`);
  if (candidate < today) {
    candidate.setFullYear(thisYear + 1);
  }
  return Math.round((candidate.getTime() - today.getTime()) / 86_400_000);
}

/**
 * Build a minimal inline TaskTemplate for resource-generated tasks.
 * Stored under a deterministic key in useScheduleStore.taskTemplates.
 */
function ensureTemplate(
  key: string,
  name: string,
  taskType: TaskTemplate['taskType'],
  xpAward: Partial<TaskTemplate['xpAward']>,
): TaskTemplate {
  const scheduleStore = useScheduleStore.getState();
  const existing = scheduleStore.taskTemplates[key];
  if (existing) return existing;

  const template: TaskTemplate = {
    name,
    description: '',
    icon: 'resource-task',
    taskType,
    inputFields: taskType === 'CHECK'
      ? { label: name }
      : taskType === 'COUNTER'
        ? { target: 1, unit: 'unit', step: 1 }
        : taskType === 'LOG'
          ? { fields: [] }
          : taskType === 'CHECKLIST'
            ? { items: [] }
            : { label: name },
    xpAward: {
      health: 0,
      strength: 0,
      agility: 0,
      defense: xpAward.defense ?? 5,
      charisma: xpAward.charisma ?? 0,
      wisdom: xpAward.wisdom ?? 0,
    },
    cooldown: null,
    media: null,
    items: [],
    secondaryTag: null,
  };

  scheduleStore.setTaskTemplate(key, template);
  return template;
}

// ── GENERATE SCHEDULED TASKS ──────────────────────────────────────────────────

/**
 * Generate PlannedEvent entries from a Resource's scheduled task definitions.
 * Writes to useScheduleStore + storageLayer.
 *
 * Contact  → annual birthday PlannedEvent (if birthday set)
 * Account  → recurring transaction PlannedEvent (if recurrenceRuleRef set)
 * Inventory → weekly replenishment review PlannedEvent
 * Home / Vehicle → returns [] — recurring tasks via MULTI-USER stub
 * Doc → returns [] — course progression deferred
 *
 * @returns Array of PlannedEvents created (empty if none applicable)
 */
export function generateScheduledTasks(resource: Resource): PlannedEvent[] {
  const created: PlannedEvent[] = [];

  switch (resource.type) {
    case 'contact':
      created.push(..._genContactSchedule(resource));
      break;
    case 'account':
      created.push(..._genAccountSchedule(resource));
      break;
    case 'inventory':
      created.push(..._genInventorySchedule(resource));
      break;
    case 'home':
    case 'vehicle':
    case 'doc':
      // Home + Vehicle — recurring tasks deferred to MULTI-USER stub
      // Doc — course progression deferred (BUILD-time task)
      break;
  }

  for (const pe of created) {
    useScheduleStore.getState().setPlannedEvent(pe);
    storageSet(storageKey.plannedEvent(pe.id), pe);
  }

  return created;
}

function _genContactSchedule(resource: Resource): PlannedEvent[] {
  const meta = resource.meta as ContactMeta;
  if (!meta.info?.birthday) return [];

  const templateKey = `resource-task:${resource.id}:birthday`;
  ensureTemplate(
    templateKey,
    `${resource.name} — Birthday`,
    'CHECK',
    { wisdom: 5 },
  );

  const birthday = meta.info.birthday.slice(0, 10);
  const parts = birthday.split('-');
  if (parts.length < 3) return [];

  const thisYear = new Date().getFullYear();
  const seedDate = `${thisYear}-${parts[1]}-${parts[2]}`;

  const pe: PlannedEvent = {
    id: uuidv4(),
    name: `${resource.name} — Birthday`,
    description: `Birthday reminder for ${resource.name}`,
    icon: 'birthday',
    color: '#f59e0b',
    seedDate,
    dieDate: null,
    recurrenceInterval: {
      frequency: 'monthly',
      days: [],
      interval: 12,
      endsOn: null,
      customCondition: 'annual-birthday',
    },
    activeState: 'active',
    taskPool: [templateKey],
    taskPoolCursor: 0,
    taskList: [templateKey],
    conflictMode: 'concurrent',
    startTime: '09:00',
    endTime: '09:15',
    location: null,
    sharedWith: null,
    pushReminder: null,
  };

  return [pe];
}

function _genAccountSchedule(resource: Resource): PlannedEvent[] {
  const meta = resource.meta as AccountMeta;
  if (!meta.recurrenceRuleRef) return [];

  const templateKey = `resource-task:${resource.id}:transaction`;
  const template = ensureTemplate(
    templateKey,
    `${resource.name} — Transaction`,
    'LOG',
    { defense: 5 },
  );
  void template; // ensureTemplate stored it; ref unused here

  const pe: PlannedEvent = {
    id: uuidv4(),
    name: `${resource.name} — Transaction`,
    description: `Log transaction for ${resource.name}`,
    icon: 'account',
    color: '#10b981',
    seedDate: todayISO(),
    dieDate: null,
    recurrenceInterval: {
      frequency: 'monthly',
      days: [],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    activeState: 'active',
    taskPool: [templateKey],
    taskPoolCursor: 0,
    taskList: [templateKey],
    conflictMode: 'concurrent',
    startTime: '10:00',
    endTime: '10:15',
    location: null,
    sharedWith: null,
    pushReminder: null,
  };

  return [pe];
}

function _genInventorySchedule(resource: Resource): PlannedEvent[] {
  const templateKey = `resource-task:${resource.id}:replenish`;
  const template = ensureTemplate(
    templateKey,
    `${resource.name} — Stock Review`,
    'CHECKLIST',
    { defense: 5 },
  );
  void template;

  const pe: PlannedEvent = {
    id: uuidv4(),
    name: `${resource.name} — Stock Review`,
    description: `Weekly replenishment review for ${resource.name}`,
    icon: 'inventory',
    color: '#8b5cf6',
    seedDate: todayISO(),
    dieDate: null,
    recurrenceInterval: {
      frequency: 'weekly',
      days: ['mon'],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    activeState: 'active',
    taskPool: [templateKey],
    taskPoolCursor: 0,
    taskList: [templateKey],
    conflictMode: 'concurrent',
    startTime: '10:00',
    endTime: '10:20',
    location: null,
    sharedWith: null,
    pushReminder: null,
  };

  return [pe];
}

// ── GENERATE GTD ITEMS ────────────────────────────────────────────────────────

/**
 * Compute immediate-action GTD Tasks from a Resource's current state.
 * Writes Tasks to scheduleStore + storage and appends task IDs to User.lists.gtdList.
 *
 * Contact  → CHECK task if birthday within 30 days
 * Account  → LOG task for each pending transaction in 'pending' status
 * Inventory → COUNTER task for low-stock items (quantity ≤ 0)
 * Home / Vehicle / Doc → [] (no immediate GTD items from current meta)
 *
 * @returns Array of Task objects created
 */
export function generateGTDItems(resource: Resource): Task[] {
  const created: Task[] = [];

  switch (resource.type) {
    case 'contact':
      created.push(..._genContactGTD(resource));
      break;
    case 'account':
      created.push(..._genAccountGTD(resource));
      break;
    case 'inventory':
      created.push(..._genInventoryGTD(resource));
      break;
    case 'home':
    case 'vehicle':
    case 'doc':
      break;
  }

  if (created.length > 0) {
    const scheduleStore = useScheduleStore.getState();
    const userStore = useUserStore.getState();
    const latestUser = userStore.user;
    if (latestUser) {
      for (const task of created) {
        scheduleStore.setTask(task);
        storageSet(storageKey.task(task.id), task);
      }
      const updatedUser: User = {
        ...latestUser,
        lists: {
          ...latestUser.lists,
          gtdList: [...latestUser.lists.gtdList, ...created.map((t) => t.id)],
        },
      };
      userStore.setUser(updatedUser);
      storageSet('user', updatedUser);
    }
  }

  return created;
}

function _genContactGTD(resource: Resource): Task[] {
  const meta = resource.meta as ContactMeta;
  if (!meta.info?.birthday) return [];

  const days = daysUntilAnnual(meta.info.birthday);
  if (days === null || days > 30) return [];

  const templateKey = `resource-task:${resource.id}:birthday`;
  ensureTemplate(templateKey, `${resource.name} — Birthday`, 'CHECK', { wisdom: 5 });

  const task: Task = {
    id: uuidv4(),
    templateRef: templateKey,
    completionState: 'pending',
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef: resource.id,
    location: null,
    sharedWith: null,
    questRef: null,
    actRef: null,
    secondaryTag: null,
  };
  return [task];
}

function _genAccountGTD(resource: Resource): Task[] {
  const meta = resource.meta as AccountMeta;
  const pendingOnes = meta.pendingTransactions.filter((t) => t.status === 'pending');
  if (pendingOnes.length === 0) return [];

  const templateKey = `resource-task:${resource.id}:transaction`;
  ensureTemplate(templateKey, `${resource.name} — Transaction`, 'LOG', { defense: 5 });

  return pendingOnes.map(() => ({
    id: uuidv4(),
    templateRef: templateKey,
    completionState: 'pending' as const,
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef: resource.id,
    location: null,
    sharedWith: null,
    questRef: null,
    actRef: null,
    secondaryTag: null,
  }));
}

function _genInventoryGTD(resource: Resource): Task[] {
  const meta = resource.meta as InventoryMeta;
  const lowStock = meta.items.filter((item) => item.quantity <= 0);
  if (lowStock.length === 0) return [];

  const templateKey = `resource-task:${resource.id}:replenish`;
  ensureTemplate(templateKey, `${resource.name} — Replenish`, 'COUNTER', { defense: 5 });

  return lowStock.map(() => ({
    id: uuidv4(),
    templateRef: templateKey,
    completionState: 'pending' as const,
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef: resource.id,
    location: null,
    sharedWith: null,
    questRef: null,
    actRef: null,
    secondaryTag: null,
  }));
}

/**
 * Doc generates tasks via course progression.
 * STUB — deferred until Course Doc progression shape is decided (BUILD-time task).
 */
export function generateDocTasks_stub(): void {
  // Deferred: Course Doc progression shape not yet decided.
  // Implementation pending BUILD-time task.
}

// ── COMPUTE GTD LIST ──────────────────────────────────────────────────────────

/**
 * Scan all active Resources for a User, generate GTD items per resource, and
 * return a merged, deduplicated, ordered Task list (D05).
 *
 * Does NOT write to storage (read-only scan). Call generateGTDItems() to also
 * persist and enqueue items.
 */
export function computeGTDList(user: User): Task[] {
  const scheduleStore = useScheduleStore.getState();
  const resourceStore = useResourceStore.getState();

  // Resolve existing gtdList Task refs → Tasks
  const existing = new Map<string, Task>();
  for (const taskId of user.lists.gtdList) {
    const task = scheduleStore.tasks[taskId];
    if (task && task.completionState === 'pending') {
      existing.set(taskId, task);
    }
  }

  // Scan all resource refs and generate fresh items for any resource not covered
  const allResourceIds = [
    ...user.resources.contacts,
    ...user.resources.homes,
    ...user.resources.vehicles,
    ...user.resources.accounts,
    ...user.resources.inventory,
    ...user.resources.docs,
  ];

  const generatedIds = new Set<string>(existing.keys());
  const fresh: Task[] = [];

  for (const resourceId of allResourceIds) {
    const resource = resourceStore.resources[resourceId];
    if (!resource) continue;
    const generated = generateGTDItems(resource);
    for (const task of generated) {
      if (!generatedIds.has(task.id)) {
        generatedIds.add(task.id);
        fresh.push(task);
      }
    }
  }

  // Merge: existing pending tasks + freshly generated, ordered by creation (fresh last)
  return [...Array.from(existing.values()), ...fresh];
}

// ── COMPLETE GTD ITEM ─────────────────────────────────────────────────────────

/**
 * Mark a GTD Task complete, write the completion to today's QuickActionsEvent,
 * award XP, call checkAchievements(), and fire a ribbet.
 *
 * Reads  — useScheduleStore.tasks, useScheduleStore.activeEvents
 * Writes — useScheduleStore.tasks, useUserStore (XP + stats + feed), storageLayer
 *
 * @param itemId  Task id to complete
 * @param user    Current User — for QuickActionsEvent routing
 */
export function completeGTDItem(itemId: string, user: User): void {
  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();

  const task = scheduleStore.tasks[itemId];
  if (!task) {
    console.warn(`[resourceEngine] completeGTDItem: Task "${itemId}" not found`);
    return;
  }
  if (task.completionState !== 'pending') return;

  const now = new Date().toISOString();
  const updatedTask: Task = { ...task, completionState: 'complete', completedAt: now };

  scheduleStore.setTask(updatedTask);
  storageSet(storageKey.task(itemId), updatedTask);

  // Write to today's QuickActionsEvent (date-keyed singleton per D12)
  const today = todayISO();
  const qaId = `qa-${today}`;
  const qa = scheduleStore.activeEvents[qaId] as QuickActionsEvent | undefined;
  if (qa) {
    const updatedQa: QuickActionsEvent = {
      ...qa,
      completions: [...qa.completions, { taskRef: itemId, completedAt: now }],
    };
    scheduleStore.setActiveEvent(updatedQa);
    storageSet(storageKey.quickActions(today), updatedQa);
  }

  // Remove from gtdList now that it's complete
  const freshUser = useUserStore.getState().user ?? user;
  const withoutItem: User = {
    ...freshUser,
    lists: {
      ...freshUser.lists,
      gtdList: freshUser.lists.gtdList.filter((id) => id !== itemId),
    },
  };
  userStore.setUser(withoutItem);
  storageSet('user', withoutItem);

  // XP award — +2 agility (QuickActions context) + +2 defense (resource context)
  const userId = withoutItem.system.id;
  const template = scheduleStore.taskTemplates[task.templateRef];
  if (template) {
    const baseXP = Object.values(template.xpAward).reduce((s, v) => s + v, 0);
    awardXP(userId, baseXP + 4); // +2 agility + +2 defense
    awardStat(userId, 'agility', 2);
    awardStat(userId, 'defense', 2);
  } else {
    awardXP(userId, 9);
    awardStat(userId, 'wisdom', 25);
  }

  // Achievement check + badge awards
  const latestUser = useUserStore.getState().user;
  if (latestUser) {
    const newAchs = checkAchievements(latestUser);
    let currentUser = latestUser;
    for (const ach of newAchs) {
      currentUser = awardBadge(ach, currentUser);
    }
  }

  pushRibbet('gtd.completed');
}
