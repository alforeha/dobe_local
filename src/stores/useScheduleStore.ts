// ─────────────────────────────────────────
// useScheduleStore — SCHEDULE STORE
// Holds: PlannedEvents, Events (active + history), QuickActionsEvent,
//        Tasks, TaskTemplates (user custom only — D34).
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlannedEvent, Event, QuickActionsEvent, Task, TaskTemplate } from '../types';

// ── STATE ─────────────────────────────────────────────────────────────────────

interface ScheduleState {
  /** Keyed by PlannedEvent.id */
  plannedEvents: Record<string, PlannedEvent>;
  /** Keyed by Event.id — active events (includes QuickActionsEvent for today) */
  activeEvents: Record<string, Event | QuickActionsEvent>;
  /** Keyed by Event.id — completed/skipped history */
  historyEvents: Record<string, Event | QuickActionsEvent>;
  /** Keyed by Task.id */
  tasks: Record<string, Task>;
  /** Keyed by a stable key — user custom templates only (D34) */
  taskTemplates: Record<string, TaskTemplate>;
}

// ── ACTIONS ───────────────────────────────────────────────────────────────────

interface ScheduleActions {
  setPlannedEvent: (plannedEvent: PlannedEvent) => void;
  removePlannedEvent: (id: string) => void;

  setActiveEvent: (event: Event | QuickActionsEvent) => void;
  archiveEvent: (eventId: string) => void;

  setTask: (task: Task) => void;
  removeTask: (taskId: string) => void;

  setTaskTemplate: (key: string, template: TaskTemplate) => void;
  removeTaskTemplate: (key: string) => void;

  reset: () => void;
}

// ── INITIAL STATE ─────────────────────────────────────────────────────────────

const initialState: ScheduleState = {
  plannedEvents: {},
  activeEvents: {},
  historyEvents: {},
  tasks: {},
  taskTemplates: {},
};

// ── STORE ─────────────────────────────────────────────────────────────────────

export const useScheduleStore = create<ScheduleState & ScheduleActions>()(
  persist(
    (set) => ({
      ...initialState,

      setPlannedEvent: (plannedEvent) => {
        set((state) => ({
          plannedEvents: { ...state.plannedEvents, [plannedEvent.id]: plannedEvent },
        }));
        // TODO: MVP06 — storageSet(storageKey.plannedEvent(plannedEvent.id), plannedEvent)
      },

      removePlannedEvent: (id) => {
        set((state) => {
          const plannedEvents = { ...state.plannedEvents };
          delete plannedEvents[id];
          return { plannedEvents };
        });
        // TODO: MVP06 — storageDelete(storageKey.plannedEvent(id))
      },

      setActiveEvent: (event) => {
        set((state) => ({
          activeEvents: { ...state.activeEvents, [event.id]: event },
        }));
        // TODO: MVP06 — persist to event:{uuid} or qa:{date} via storageLayer
      },

      archiveEvent: (eventId) =>
        set((state) => {
          const event = state.activeEvents[eventId];
          if (!event) return {};
          const activeEvents = { ...state.activeEvents };
          delete activeEvents[eventId];
          return {
            activeEvents,
            historyEvents: { ...state.historyEvents, [eventId]: event },
          };
        }),

      setTask: (task) => {
        set((state) => ({ tasks: { ...state.tasks, [task.id]: task } }));
        // TODO: MVP06 — storageSet(storageKey.task(task.id), task)
      },

      removeTask: (taskId) => {
        set((state) => {
          const tasks = { ...state.tasks };
          delete tasks[taskId];
          return { tasks };
        });
        // TODO: MVP06 — storageDelete(storageKey.task(taskId))
      },

      setTaskTemplate: (key, template) => {
        set((state) => ({
          taskTemplates: { ...state.taskTemplates, [key]: template },
        }));
        // TODO: MVP06 — storageSet(storageKey.taskTemplate(key), template)
      },

      removeTaskTemplate: (key) => {
        set((state) => {
          const taskTemplates = { ...state.taskTemplates };
          delete taskTemplates[key];
          return { taskTemplates };
        });
        // TODO: MVP06 — storageDelete(storageKey.taskTemplate(key))
      },

      reset: () => set(initialState),
    }),
    { name: 'cdb-schedule' },
  ),
);
