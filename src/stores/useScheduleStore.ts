// ─────────────────────────────────────────
// useScheduleStore — SCHEDULE STORE
// Holds: PlannedEvents, Events (active + history), QuickActionsEvent,
//        Tasks, TaskTemplates (user custom only — D34).
// DEVICE → cloud sync in MULTI-USER.
// ─────────────────────────────────────────

import { create } from 'zustand';
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

export const useScheduleStore = create<ScheduleState & ScheduleActions>()((set) => ({
  ...initialState,

  setPlannedEvent: (_plannedEvent) => {
    void _plannedEvent;
    // TODO: implement — upsert, persist to localStorage key plannedEvent:{uuid}
  },

  removePlannedEvent: (_id) => {
    void _id;
    // TODO: implement
  },

  setActiveEvent: (_event) => {
    void _event;
    // TODO: implement — upsert to activeEvents, persist to event:{uuid} or qa:{date}
  },

  archiveEvent: (_eventId) => {
    void _eventId;
    // TODO: implement — move from activeEvents → historyEvents at rollover
  },

  setTask: (_task) => {
    void _task;
    // TODO: implement — upsert, persist to localStorage key task:{uuid}
  },

  removeTask: (_taskId) => {
    void _taskId;
    // TODO: implement
  },

  setTaskTemplate: (_key, _template) => {
    void _key; void _template;
    // TODO: implement — persist to localStorage key taskTemplate:{uuid}
  },

  removeTaskTemplate: (_key) => {
    void _key;
    // TODO: implement
  },

  reset: () => set(initialState),
}));
