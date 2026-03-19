// ─────────────────────────────────────────
// MATERIALISE — PLANNED EVENT → EVENT
// Converts a PlannedEvent into a concrete Event instance.
//
// Called by two paths:
//   1. Same-day creation — immediately after a PlannedEvent is saved with seedDate === today
//   2. Midnight rollover engine — step 3 of the 9-step sequence (D14)
//
// Both paths converge on the same materialisePlannedEvent() output.
// ─────────────────────────────────────────

import { v4 as uuidv4 } from 'uuid';
import type { PlannedEvent } from '../types/plannedEvent';
import type { Event } from '../types/event';
import type { Task } from '../types/task';
import type { TaskTemplate } from '../types/taskTemplate';
import { useScheduleStore } from '../stores/useScheduleStore';
import { storageSet, storageKey } from '../storage';

// ── RESULT SHAPE ─────────────────────────────────────────────────────────────

export interface MaterialiseResult {
  event: Event;
  tasks: Task[];
  /** Updated PlannedEvent with advanced taskPoolCursor */
  updatedPlannedEvent: PlannedEvent;
}

// ── CURSOR ADVANCE (D47) ──────────────────────────────────────────────────────

/**
 * Read the current cursor, return the templateRef at that position,
 * and compute the next cursor (wraps at pool end).
 * Returns null for templateRef when taskPool is empty.
 */
export function advanceCursor(pe: PlannedEvent): {
  templateRef: string | null;
  nextCursor: number;
} {
  if (pe.taskPool.length === 0) {
    return { templateRef: null, nextCursor: 0 };
  }
  const cursor = pe.taskPoolCursor ?? 0;
  const safeIndex = cursor % pe.taskPool.length;
  const templateRef = pe.taskPool[safeIndex];
  const nextCursor = (safeIndex + 1) % pe.taskPool.length;
  return { templateRef, nextCursor };
}

// ── TASK INSTANTIATION ────────────────────────────────────────────────────────

/**
 * Create a bare Task instance from a TaskTemplate.
 * Caller is responsible for persisting it.
 */
function instantiateTask(templateRef: string): Task {
  return {
    id: uuidv4(),
    templateRef,
    completionState: 'pending',
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef: null,
    location: null,
    sharedWith: null,
  };
}

// ── MATERIALISE ───────────────────────────────────────────────────────────────

/**
 * Convert a PlannedEvent into a concrete Event for the given date.
 *
 * Reads   — pe.taskPool, pe.taskPoolCursor, taskTemplates map (for validation)
 * Writes  — useScheduleStore (event + tasks), storageLayer (event, tasks, plannedEvent)
 *
 * @param pe            The PlannedEvent to materialise
 * @param forDate       ISO date string (YYYY-MM-DD) this materialisation targets
 * @param taskTemplates Current taskTemplates map from useScheduleStore (passed in to
 *                      avoid re-reading the store inside the function — keeps it pure-ish)
 * @returns             MaterialiseResult containing the new Event, its Tasks, and the
 *                      updated PlannedEvent with the advanced cursor
 */
export function materialisePlannedEvent(
  pe: PlannedEvent,
  forDate: string,
  taskTemplates: Record<string, TaskTemplate>,
): MaterialiseResult {
  const { templateRef, nextCursor } = advanceCursor(pe);

  // Build task list for this event instance
  const tasks: Task[] = [];
  if (templateRef !== null) {
    // Validate the template exists — skip gracefully if missing (e.g. deleted template)
    const templateExists = templateRef in taskTemplates;
    if (templateExists) {
      tasks.push(instantiateTask(templateRef));
    } else {
      console.warn(
        `[materialise] TaskTemplate "${templateRef}" not found in store — task skipped for PlannedEvent "${pe.id}"`,
      );
    }
  }

  const taskRefs = tasks.map((t) => t.id);

  // Build the materialised Event
  const event: Event = {
    id: uuidv4(),
    eventType: 'planned',
    plannedEventRef: pe.id,
    name: pe.name,
    startDate: forDate,
    startTime: pe.startTime,
    endDate: pe.dieDate ?? forDate,
    endTime: pe.endTime,
    tasks: taskRefs,
    completionState: 'pending',
    xpAwarded: 0,
    attachments: [],
    location: pe.location,
    note: null,
    sharedWith: null,
    coAttendees: null,
  };

  const updatedPlannedEvent: PlannedEvent = {
    ...pe,
    taskPoolCursor: nextCursor,
    taskList: taskRefs,
  };

  // ── Persist ───────────────────────────────────────────────────────────────
  const scheduleStore = useScheduleStore.getState();

  // Persist tasks
  for (const task of tasks) {
    scheduleStore.setTask(task);
    storageSet(storageKey.task(task.id), task);
  }

  // Persist event
  scheduleStore.setActiveEvent(event);
  storageSet(storageKey.event(event.id), event);

  // Persist updated PlannedEvent (cursor advanced)
  scheduleStore.setPlannedEvent(updatedPlannedEvent);
  storageSet(storageKey.plannedEvent(updatedPlannedEvent.id), updatedPlannedEvent);

  return { event, tasks, updatedPlannedEvent };
}
