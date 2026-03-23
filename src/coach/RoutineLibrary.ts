// ─────────────────────────────────────────
// ROUTINE LIBRARY — PREBUILT ROUTINES
// Coach-seeded PlannedEvent templates for the Recommendations room.
// These are display-only blueprints — not stored PlannedEvents.
// When the user taps "Add to Schedule", RoutinePopup opens pre-filled.
// ─────────────────────────────────────────

import type { RecurrenceRule } from '../types/taskTemplate';

// ── PREBUILT ROUTINE TYPE ─────────────────────────────────────────────────────

export type RoutineTag =
  | 'health'
  | 'morning'
  | 'mindfulness'
  | 'evening'
  | 'work'
  | 'productivity'
  | 'fitness'
  | 'strength'
  | 'nutrition'
  | 'home'
  | 'admin'
  | 'finance';

export interface PrebuiltRoutine {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Task template IDs from TaskTemplateLibrary / StarterQuestLibrary */
  taskPool: string[];
  recurrenceInterval: RecurrenceRule;
  tags: RoutineTag[];
}

// ── PREBUILT ROUTINE DATA ─────────────────────────────────────────────────────

export const routineLibrary: PrebuiltRoutine[] = [
  {
    id: 'prebuilt-routine-morning-moves',
    name: 'Morning Moves',
    description: 'Kick off your day with hydration, a body check-in, and a mood log.',
    icon: '🌅',
    color: '#f59e0b',
    taskPool: [
      'c0ffee01-dead-4bee-f00d-a1b2c3d4e5f6', // Drink water (CHECK)
      'tmpl-body-log-000000-0000-0000-0000-01', // Log body scan (LOG)
      'tmpl-mood-log-000000-0000-0000-0000-01', // Log mood (RATING)
    ],
    recurrenceInterval: {
      frequency: 'daily',
      days: [],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['health', 'morning'],
  },
  {
    id: 'prebuilt-routine-evening-relax',
    name: 'Evening Relax',
    description: 'Wind down with a meditation session and a reflective journal entry.',
    icon: '🌙',
    color: '#8b5cf6',
    taskPool: [
      'e5f6a7b8-c9d0-4123-af01-234567890123', // Meditation timer (TIMER)
      'a7b8c9d0-e1f2-4345-a123-456789012345', // Journal entry (TEXT)
    ],
    recurrenceInterval: {
      frequency: 'daily',
      days: [],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['mindfulness', 'evening'],
  },
  {
    id: 'prebuilt-routine-work-block',
    name: 'Work Block',
    description: 'Stay productive with a focused deep-work session and inbox clear.',
    icon: '💼',
    color: '#3b82f6',
    taskPool: [
      'd4e5f6a7-b8c9-4012-9ef0-123456789012', // Focused work block (DURATION)
      'tmpl-clear-inbox-0000-0000-0000-0001',  // Clear inbox (CHECKLIST)
    ],
    recurrenceInterval: {
      frequency: 'weekly',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['work', 'productivity'],
  },
  {
    id: 'prebuilt-routine-exercise',
    name: 'Exercise',
    description: 'Build strength and track your workout with sets, reps, and a session log.',
    icon: '🏋️',
    color: '#ef4444',
    taskPool: [
      'b2c3d4e5-f6a7-4890-bcde-f01234567890', // Strength set (SETS_REPS)
      'f2a3b4c5-d6e7-4890-b678-901234567890', // Workout log (LOG)
    ],
    recurrenceInterval: {
      frequency: 'weekly',
      days: ['mon', 'wed', 'fri'],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['fitness', 'strength'],
  },
  {
    id: 'prebuilt-routine-meal-prep',
    name: 'Meal Prep',
    description: 'Stay on top of nutrition with a meal log and shopping check.',
    icon: '🥗',
    color: '#10b981',
    taskPool: [
      'tmpl-meal-log-000000-0000-0000-0000-01', // Log meal (LOG)
      'd0e1f2a3-b4c5-4678-9456-789012345678',   // Morning routine (CHECKLIST) — repurposed as shopping check
    ],
    recurrenceInterval: {
      frequency: 'weekly',
      days: ['sun'],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['nutrition', 'home'],
  },
  {
    id: 'prebuilt-routine-weekly-review',
    name: 'Weekly Review',
    description: 'Reflect on the week with a structured review form and transaction log.',
    icon: '📋',
    color: '#6366f1',
    taskPool: [
      'b8c9d0e1-f2a3-4456-b234-567890123456', // Weekly review (FORM)
      'tmpl-log-transaction-0-0000-0000-0001', // Log transaction (LOG)
    ],
    recurrenceInterval: {
      frequency: 'weekly',
      days: ['sun'],
      interval: 1,
      endsOn: null,
      customCondition: null,
    },
    tags: ['admin', 'finance'],
  },
];
