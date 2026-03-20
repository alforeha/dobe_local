// ─────────────────────────────────────────
// EVENT EXECUTION
// Task completion and Event completion logic.
//
// completeTask()  — marks a Task complete, records result, triggers XP + stat award
// completeEvent() — marks an Event complete when all required tasks are done
//
// Evidence / attachment: records an OPFS file reference + metadata in localStorage
// per D46. Max 5 attachments per Event (EVENT_MAX_ATTACHMENTS from storageBudget).
// ─────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types/task';
import type { Event } from '../types/event';
import type { InputFields } from '../types/taskTemplate';
import type { StatGroupKey } from '../types/user';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useUserStore } from '../stores/useUserStore';
import { storageSet, storageKey } from '../storage';
import { EVENT_MAX_ATTACHMENTS } from '../storage/storageBudget';
import { awardXP, awardStat } from './awardPipeline';
import { completeMilestone } from './markerEngine';

// ── TASK RESULT SHAPE ─────────────────────────────────────────────────────────

export interface TaskResult {
  /** Recorded values matching the inputFields shape of the TaskTemplate (D41) */
  resultFields: Partial<InputFields>;
  /** Optional resource context — enables +2 defense bonus routing (D40) */
  resourceRef?: string | null;
  /** Optional location recorded during completion */
  location?: Task['location'];
}

// ── ATTACHMENT RECORD (D46) ───────────────────────────────────────────────────

export interface AttachmentRecord {
  /** OPFS file reference path — e.g. the file name or handle path */
  opfsRef: string;
  /** File size in bytes — enforced ≤ 200 KB (D09) */
  sizeBytes: number;
  /** MIME type or descriptor: image, text, doc, etc. */
  mimeType: string;
  /** ISO timestamp of when the attachment was recorded */
  recordedAt: string;
  /** Optional Task ref for contract validation flow */
  taskRef: string | null;
}

// ── COMPLETE TASK ─────────────────────────────────────────────────────────────

/**
 * Mark a Task complete, record its result, and trigger XP + stat awards.
 *
 * Reads  — useScheduleStore.tasks, useScheduleStore.taskTemplates
 * Writes — useScheduleStore.tasks, useUserStore (XP + stats), storageLayer
 *
 * @param taskId   id of the Task to complete
 * @param eventId  id of the parent Event (used to determine context bonus)
 * @param result   recorded values + optional resource/location context
 */
export function completeTask(
  taskId: string,
  eventId: string,
  result: TaskResult,
): void {
  const scheduleStore = useScheduleStore.getState();
  const userStore = useUserStore.getState();

  const task = scheduleStore.tasks[taskId];
  if (!task) {
    console.warn(`[eventExecution] completeTask: Task "${taskId}" not found`);
    return;
  }
  if (task.completionState === 'complete') {
    console.warn(`[eventExecution] completeTask: Task "${taskId}" already complete`);
    return;
  }

  const now = new Date().toISOString();

  const updatedTask: Task = {
    ...task,
    completionState: 'complete',
    completedAt: now,
    resultFields: result.resultFields,
    resourceRef: result.resourceRef ?? task.resourceRef,
    location: result.location ?? task.location,
  };

  scheduleStore.setTask(updatedTask);
  storageSet(storageKey.task(taskId), updatedTask);

  // Quest check-in hook: if this task was fired by a Marker, record the Milestone
  // and evaluate the Quest finish condition (D04).
  if (updatedTask.questRef) {
    completeMilestone(updatedTask);
  }

  // Determine context for bonuses
  const event = scheduleStore.activeEvents[eventId] ??
    scheduleStore.historyEvents[eventId];
  const isQuickActions =
    event && 'eventType' in event && event.eventType === 'quickActions';
  const hasResourceRef =
    Boolean(result.resourceRef) || Boolean(task.resourceRef);

  // Fetch template to get xpAward and stat group
  const template = scheduleStore.taskTemplates[task.templateRef];

  if (userStore.user) {
    const userId = userStore.user.system.id;

    if (template) {
      // Award XP — base from template + context multipliers
      const baseXP = Object.values(template.xpAward).reduce((s, v) => s + v, 0);
      const contextBonuses: number[] = [];
      if (isQuickActions) contextBonuses.push(2); // +2 agility bonus handled in awardStat
      if (hasResourceRef) contextBonuses.push(2); // +2 defense bonus

      const bonusTotal = contextBonuses.reduce((s, v) => s + v, 0);
      awardXP(userId, baseXP + bonusTotal);

      // Award stat points per xpAward distribution
      const statGroups = template.xpAward;
      for (const [group, points] of Object.entries(statGroups) as [StatGroupKey, number][]) {
        if (points > 0) {
          awardStat(userId, group, points);
        }
      }

      // Context-specific stat bonuses
      if (isQuickActions) {
        awardStat(userId, 'agility', 2);
      }
      if (hasResourceRef) {
        awardStat(userId, 'defense', 2);
      }
    } else {
      // No template found — apply wisdom fallback (D48)
      awardXP(userId, 5);
      awardStat(userId, 'wisdom', 25);
    }

    // Update task completion milestone counter
    // Re-fetch fresh state — awardXP/awardStat above may have written new XP/stat values.
    const freshUser = useUserStore.getState().user;
    if (freshUser) {
      const updatedUser = {
        ...freshUser,
        progression: {
          ...freshUser.progression,
          stats: {
            ...freshUser.progression.stats,
            milestones: {
              ...freshUser.progression.stats.milestones,
              tasksCompleted: freshUser.progression.stats.milestones.tasksCompleted + 1,
            },
          },
        },
      };
      userStore.setUser(updatedUser);
      storageSet('user', updatedUser);
    }
  }
}

// ── COMPLETE EVENT ────────────────────────────────────────────────────────────

/**
 * Mark an Event complete if all its required tasks are done.
 * An Event is complete when every Task in event.tasks has completionState 'complete' or 'skipped'.
 *
 * Reads  — useScheduleStore.activeEvents, useScheduleStore.tasks
 * Writes — useScheduleStore.activeEvents, storageLayer
 *
 * @param eventId  id of the Event to complete
 */
export function completeEvent(eventId: string): void {
  const scheduleStore = useScheduleStore.getState();
  const event = scheduleStore.activeEvents[eventId];

  if (!event || event.eventType === 'quickActions') {
    // QuickActionsEvent is never "completed" — it rolls over at midnight
    return;
  }

  const typedEvent = event as Event;
  if (typedEvent.completionState === 'complete') return;

  const allDone = typedEvent.tasks.every((taskId) => {
    const t = scheduleStore.tasks[taskId];
    return t?.completionState === 'complete' || t?.completionState === 'skipped';
  });

  if (!allDone) return;

  const totalXP = typedEvent.tasks.reduce((sum, taskId) => {
    const t = scheduleStore.tasks[taskId];
    if (!t || t.completionState !== 'complete') return sum;
    const template = scheduleStore.taskTemplates[t.templateRef];
    if (!template) return sum;
    return sum + Object.values(template.xpAward).reduce((s, v) => s + v, 0);
  }, 0);

  const updatedEvent: Event = {
    ...typedEvent,
    completionState: 'complete',
    xpAwarded: totalXP,
  };

  scheduleStore.setActiveEvent(updatedEvent);
  storageSet(storageKey.event(eventId), updatedEvent);
}

// ── RECORD ATTACHMENT (D46) ───────────────────────────────────────────────────

/**
 * Record an OPFS file reference as an attachment on an Event.
 * Enforces the max 5 attachment cap (EVENT_MAX_ATTACHMENTS) per D09/D46.
 *
 * The Attachment ItemTemplate record is stored under attachment:{uuid} in localStorage.
 * The Event.attachments[] array is updated with the new attachment id.
 *
 * @param eventId     id of the Event to attach to
 * @param attachment  OPFS file ref, size, type, and optional taskRef
 * @returns           The new attachment id, or null if cap exceeded
 */
export function recordAttachment(
  eventId: string,
  attachment: AttachmentRecord,
): string | null {
  const scheduleStore = useScheduleStore.getState();
  const event = scheduleStore.activeEvents[eventId] as Event | undefined;

  if (!event || event.eventType === 'quickActions') {
    console.warn(`[eventExecution] recordAttachment: Event "${eventId}" not found or is QA event`);
    return null;
  }

  if (event.attachments.length >= EVENT_MAX_ATTACHMENTS) {
    console.warn(
      `[eventExecution] recordAttachment: Event "${eventId}" is at attachment cap (${EVENT_MAX_ATTACHMENTS})`,
    );
    return null;
  }

  const attachmentId = uuidv4();

  // Persist the Attachment record in localStorage (ItemTemplate shape)
  const attachmentRecord = {
    id: attachmentId,
    type: 'attachment',
    name: attachment.opfsRef,
    description: '',
    icon: '',
    source: 'user',
    contents: {
      fileRef: attachment.opfsRef,
      size: attachment.sizeBytes,
      type: attachment.mimeType,
      taskRef: attachment.taskRef,
      validationStatus: null,
      approverRef: null,
    },
  };

  storageSet(storageKey.attachment(attachmentId), attachmentRecord);

  // Update the event to reference the new attachment
  const updatedEvent: Event = {
    ...event,
    attachments: [...event.attachments, attachmentId],
  };

  scheduleStore.setActiveEvent(updatedEvent);
  storageSet(storageKey.event(eventId), updatedEvent);

  return attachmentId;
}
