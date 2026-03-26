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
import type { Resource, ContactMeta, AccountMeta, InventoryMeta, VehicleMeta, DocMeta } from '../types/resource';
import type { PlannedEvent } from '../types/plannedEvent';
import type { Task } from '../types/task';
import type { TaskTemplate } from '../types/taskTemplate';
import type { InputFields } from '../types/taskTemplate';
import type { User } from '../types/user';
import { getAppDate, getAppNowISO } from '../utils/dateUtils';
import type { QuickActionsEvent } from '../types/event';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useUserStore } from '../stores/useUserStore';
import { useResourceStore } from '../stores/useResourceStore';
import { useProgressionStore } from '../stores/useProgressionStore';

import { awardXP, awardStat } from './awardPipeline';
import { completeMilestone, decodeQuestRef } from './markerEngine';
import { checkAchievements } from '../coach/checkAchievements';
import { awardBadge } from '../coach/rewardPipeline';
import { pushRibbet } from '../coach/ribbet';
import { starterTaskTemplates, STARTER_TEMPLATE_IDS } from '../coach/StarterQuestLibrary';
import { isWisdomTemplate } from './xpBoosts';

// ── HELPERS ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return getAppDate();
}

function isOnboardingQuestTemplate(templateRef: string): boolean {
  return (
    templateRef === STARTER_TEMPLATE_IDS.openWelcomeEvent ||
    templateRef === STARTER_TEMPLATE_IDS.setupSchedule ||
    templateRef === STARTER_TEMPLATE_IDS.learnGrounds ||
    templateRef === STARTER_TEMPLATE_IDS.claimIdentity
  );
}

function hasCompletedQuickActionTask(templateRef: string): boolean {
  const scheduleStore = useScheduleStore.getState();
  for (const event of Object.values(scheduleStore.activeEvents)) {
    if (!('eventType' in event) || event.eventType !== 'quickActions') continue;
    const quickActions = event as QuickActionsEvent;
    for (const completion of quickActions.completions) {
      const task = scheduleStore.tasks[completion.taskRef];
      if (!task) continue;
      if (task.templateRef !== templateRef) continue;
      if (task.completionState !== 'complete') continue;
      return true;
    }
  }
  return false;
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
 * Days until an absolute future date (not annualised).
 * Returns null if date is not parseable. Negative = in the past.
 */
function daysUntilDate(isoDate: string): number | null {
  const today = new Date(todayISO() + 'T00:00:00');
  const target = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
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
    isSystem: true,   // hide from Stat Tasks tab — resource templates are internal
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
 * No-op stub — PlannedEvents are NOT created from Resource data (D97: resource
 * events are virtual).  GTD push is handled exclusively by generateGTDItems().
 * Call sites are preserved so callers need not change.
 *
 * @returns Empty array — no PlannedEvents created.
 */
// (commented out) eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateScheduledTasks(_resource: Resource): PlannedEvent[] {
  return [];
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
      created.push(..._genHomeGTD(resource));
      break;
    case 'vehicle':
      created.push(..._genVehicleGTD(resource));
      break;
    case 'doc':
      created.push(..._genDocGTD(resource));
      break;
  }

  if (created.length > 0) {
    const scheduleStore = useScheduleStore.getState();
    const userStore = useUserStore.getState();
    const latestUser = userStore.user;
    if (latestUser) {
      for (const task of created) {
        scheduleStore.setTask(task);
      }
      const updatedUser: User = {
        ...latestUser,
        lists: {
          ...latestUser.lists,
          gtdList: [...latestUser.lists.gtdList, ...created.map((t) => t.id)],
        },
      };
      userStore.setUser(updatedUser);
    }
  }

  return created;
}

function _genContactGTD(resource: Resource): Task[] {
  const meta = resource.meta as ContactMeta;
  if (!meta.info?.birthday) return [];

  const lead = meta.birthdayLeadDays ?? 14;
  if (lead === -1) return [];

  const days = daysUntilAnnual(meta.info.birthday);
  if (days === null || days > lead) return [];

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
  const tasks: Task[] = [];

  // Pending transactions
  const pendingOnes = meta.pendingTransactions.filter((t) => t.status === 'pending');
  if (pendingOnes.length > 0) {
    const templateKey = `resource-task:${resource.id}:transaction`;
    ensureTemplate(templateKey, `${resource.name} — Transaction`, 'LOG', { defense: 5 });
    for (const _ of pendingOnes) {
      void _;
      tasks.push({
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
      });
    }
  }

  // W25: Payment due
  if (meta.dueDate) {
    const dueLead = meta.dueDateLeadDays ?? 7;
    const d = daysUntilDate(meta.dueDate);
    if (dueLead !== -1 && d !== null && d >= 0 && d <= dueLead) {
      const label = meta.institution
        ? `Payment due: ${meta.institution}`
        : `Payment due: ${resource.name}`;
      const templateKey = `resource-task:${resource.id}:payment-due`;
      ensureTemplate(templateKey, label, 'CHECK', { defense: 8 });
      tasks.push({
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
      });
    }
  }

  return tasks;
}

function _genInventoryGTD(resource: Resource): Task[] {
  const meta = resource.meta as InventoryMeta;
  // Per-item threshold: only fire when item has an explicit threshold set
  const lowStock = meta.items.filter(
    (item) => item.threshold != null && item.quantity <= item.threshold,
  );
  if (lowStock.length === 0) return [];

  const templateKey = `resource-task:${resource.id}:replenish`;
  ensureTemplate(templateKey, `${resource.name} — Replenish`, 'COUNTER', { defense: 5 });

  return lowStock.map((item) => ({
    id: uuidv4(),
    templateRef: templateKey,
    completionState: 'pending' as const,
    completedAt: null,
    resultFields: { itemName: item.name } as Task['resultFields'],
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

// ── HOME / VEHICLE / DOC GTD + SCHEDULE HANDLERS — W23–W27 ——————————————

/** W23: Monthly home maintenance check PlannedEvent. */

/** W23: No GTD items from HomeMeta in LOCAL v1. */
function _genHomeGTD(_resource: Resource): Task[] {
  return [];
}

/** W24: GTD items for vehicle — insurance expiry (≤30d) + service date (≤14d). */
function _genVehicleGTD(resource: Resource): Task[] {
  const meta = resource.meta as VehicleMeta;
  const tasks: Task[] = [];

  if (meta.insuranceExpiry) {
    const insuranceLead = meta.insuranceLeadDays ?? 30;
    const d = daysUntilDate(meta.insuranceExpiry);
    if (insuranceLead !== -1 && d !== null && d >= 0 && d <= insuranceLead) {
      const templateKey = `resource-task:${resource.id}:insurance`;
      ensureTemplate(
        templateKey,
        `${resource.name} — Insurance Renewal`,
        'CHECK',
        { defense: 10 },
      );
      tasks.push({
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
      });
    }
  }

  if (meta.serviceNextDate) {
    const serviceLead = meta.serviceLeadDays ?? 14;
    const d = daysUntilDate(meta.serviceNextDate);
    if (serviceLead !== -1 && d !== null && d >= 0 && d <= serviceLead) {
      const templateKey = `resource-task:${resource.id}:service`;
      ensureTemplate(
        templateKey,
        `${resource.name} — Service Due`,
        'CHECK',
        { defense: 8 },
      );
      tasks.push({
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
      });
    }
  }

  return tasks;
}

/** W27: GTD item for doc expiry within configurable lead days (default 30). */
function _genDocGTD(resource: Resource): Task[] {
  const meta = resource.meta as DocMeta;
  if (!meta.expiryDate) return [];

  const lead = meta.expiryLeadDays ?? 30;
  if (lead === -1) return [];

  const d = daysUntilDate(meta.expiryDate);
  if (d === null || d < 0 || d > lead) return [];

  const templateKey = `resource-task:${resource.id}:expiry`;
  ensureTemplate(templateKey, `${resource.name} — Expiry`, 'CHECK', { defense: 8 });

  return [{
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
  }];
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
export function dismissGTDItem(itemId: string, user: User): void {
  const latestUser = useUserStore.getState().user ?? user;
  useUserStore.getState().setUser({
    ...latestUser,
    lists: {
      ...latestUser.lists,
      gtdList: latestUser.lists.gtdList.filter((id) => id !== itemId),
    },
  });
}

export function completeGTDItem(
  itemId: string,
  user: User,
  resultFields: Partial<InputFields> = {},
): void {
  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();

  const task = scheduleStore.tasks[itemId];
  if (!task) {
    console.warn(`[resourceEngine] completeGTDItem: Task "${itemId}" not found`);
    return;
  }
  if (task.completionState !== 'pending') return;

  const now = getAppNowISO();
  const updatedTask: Task = {
    ...task,
    completionState: 'complete',
    completedAt: now,
    resultFields,
  };

  scheduleStore.setTask(updatedTask);

  // Route quest milestone through the quest engine (was bypassed before — FIX)
  if (updatedTask.questRef) {
    completeMilestone(updatedTask);
  }

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

  // XP award — +2 agility (QuickActions context) + +2 defense (resource context)
  const userId = withoutItem.system.id;
  const template =
    scheduleStore.taskTemplates[task.templateRef] ??
    starterTaskTemplates.find((t) => t.id === task.templateRef) ??
    null;
  if (template) {
    const baseXP = Object.values(template.xpAward).reduce((s, v) => s + v, 0) + (template.xpBonus ?? 0);
    const onboardingQuestTask = isOnboardingQuestTemplate(task.templateRef);
    awardXP(userId, onboardingQuestTask ? baseXP : baseXP + 4, {
      isWisdomTask: isWisdomTemplate(template),
    });
    if (!onboardingQuestTask) {
      awardStat(userId, 'agility', 2);
      awardStat(userId, 'defense', 2);
    }
  } else {
    awardXP(userId, 9, { isWisdomTask: true });
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

// ── AUTO-CHECK QUEST CHECKLIST ITEM (D88-auto) ───────────────────────────────

/**
 * Auto-check a single CHECKLIST item on a pending quest task in the GTD list.
 * Called when the user performs the corresponding system action (nav, routine add, etc.).
 * When all checklist items are checked, the task is routed through the normal
 * GTD completion pipeline (XP, milestone, quest progress).
 *
 * Idempotent — calling with an already-checked key is a no-op.
 *
 * @param templateRef  TaskTemplate ID — identifies which quest task to update
 * @param itemKey      Checklist item key to mark as checked
 */
export function autoCheckQuestItem(templateRef: string, itemKey: string): void {
  const scheduleStore = useScheduleStore.getState();
  const user = useUserStore.getState().user;
  if (!user) return;
  const acts = useProgressionStore.getState().acts;

  let activeQuestRef: string | null = null;
  outer:
  for (const act of Object.values(acts)) {
    for (let chainIndex = 0; chainIndex < act.chains.length; chainIndex++) {
      const chain = act.chains[chainIndex];
      for (let questIndex = 0; questIndex < chain.quests.length; questIndex++) {
        const quest = chain.quests[questIndex];
        if (quest.completionState !== 'active') continue;
        const hasMatchingMarker = quest.timely.markers.some(
          (marker) => marker.activeState && marker.taskTemplateRef === templateRef,
        );
        if (!hasMatchingMarker) continue;
        activeQuestRef = `${act.id}|${chainIndex}|${questIndex}`;
        break outer;
      }
    }
  }

  if (!activeQuestRef) return;

  const taskId =
    user.lists.gtdList.find((id) => {
      const t = scheduleStore.tasks[id];
      return (
        t?.completionState === 'pending' &&
        t.templateRef === templateRef &&
        t.questRef === activeQuestRef
      );
    }) ??
    Object.values(scheduleStore.tasks).find(
      (t) =>
        t.completionState === 'pending' &&
        t.templateRef === templateRef &&
        t.questRef === activeQuestRef,
    )?.id;

  if (!taskId) return;

  const task = scheduleStore.tasks[taskId];
  if (!task) return;

  // Resolve current items from resultFields or initialise from template shape
  const template =
    scheduleStore.taskTemplates[templateRef] ??
    starterTaskTemplates.find((t) => t.id === templateRef) ??
    null;
  const templateItems =
    (template?.inputFields as { items?: Array<{ key: string; label: string }> } | undefined)?.items ?? [];
  const rawItems = (task.resultFields as Record<string, unknown>).items;
  const rawCheckedByKey = new Map<string, boolean>(
    Array.isArray(rawItems)
      ? (rawItems as Array<{ key: string; checked?: boolean }>).map((item) => [
          item.key,
          item.checked === true,
        ])
      : [],
  );
  if (
    templateRef === STARTER_TEMPLATE_IDS.learnGrounds &&
    hasCompletedQuickActionTask(STARTER_TEMPLATE_IDS.roll)
  ) {
    rawCheckedByKey.set('complete_roll', true);
  }
  const existingItems: Array<{ key: string; label: string; checked: boolean }> = templateItems.map((item) => ({
    ...item,
    checked: rawCheckedByKey.get(item.key) === true,
  }));

  if (existingItems.length === 0) return;
  if (!existingItems.some((item) => item.key === itemKey)) return;

  // Idempotent — already checked
  if (existingItems.find((i) => i.key === itemKey)?.checked === true) return;

  const updatedItems = existingItems.map((item) =>
    item.key === itemKey ? { ...item, checked: true } : item,
  );

  // Persist partial progress — task stays 'pending' until all items are done
  scheduleStore.setTask({ ...task, resultFields: { ...task.resultFields, items: updatedItems } });

  const allDone = updatedItems.every((i) => i.checked);

  // Write incremental progressPercent so the UI reflects each step before the task completes
  if (!allDone && task.questRef) {
    const parsed = decodeQuestRef(task.questRef);
    if (parsed) {
      const { actId, chainIndex, questIndex } = parsed;
      const progressionStore = useProgressionStore.getState();
      const act = progressionStore.acts[actId];
      if (act) {
        const quest = act.chains[chainIndex]?.quests[questIndex];
        if (quest && quest.specific.targetValue > 0) {
          const checkedCount = updatedItems.filter((i) => i.checked).length;
          const progressPercent = Math.min(
            99, // cap at 99 — 100 is reserved for official completion via completeMilestone
            Math.round((checkedCount / quest.specific.targetValue) * 100),
          );
          const updatedAct = {
            ...act,
            chains: act.chains.map((c, ci: number) =>
              ci !== chainIndex
                ? c
                : {
                    ...c,
                    quests: c.quests.map((q, qi: number) =>
                      qi !== questIndex ? q : { ...q, progressPercent },
                    ),
                  },
            ),
          };
          progressionStore.setAct(updatedAct);
        }
      }
    }
  }

  // All items checked → route through normal GTD completion (XP, quest, gtdList cleanup)
  if (allDone) {
    completeGTDItem(taskId, user);
  }
}
