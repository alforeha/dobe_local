// ─────────────────────────────────────────
// RoutinePopup — ADD / EDIT Routine (PlannedEvent)
// W16 — SCHEDULE room Routines tab.
// Renders inside the Menu overlay via PopupShell.
// ─────────────────────────────────────────

import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PopupShell } from '../../../../shared/popups/PopupShell';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import { taskTemplateLibrary } from '../../../../../coach';
import { materialisePlannedEvent } from '../../../../../engine/materialise';
import { autoCheckQuestItem } from '../../../../../engine/resourceEngine';
import { STARTER_TEMPLATE_IDS } from '../../../../../coach/StarterQuestLibrary';
import { storageDelete, storageKey } from '../../../../../storage';
import { localISODate } from '../../../../../utils/dateUtils';
import type { PlannedEvent, ConflictMode } from '../../../../../types/plannedEvent';
import type { RecurrenceFrequency, RecurrenceRule, Weekday } from '../../../../../types/taskTemplate';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const COLOUR_SWATCHES = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#f97316', // orange
  '#14b8a6', // teal
  '#84cc16', // lime
];

const WEEKDAYS: { key: Weekday; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

const CONFLICT_MODES: { value: ConflictMode; label: string }[] = [
  { value: 'override', label: 'Override — replace conflicting event' },
  { value: 'shift', label: 'Shift — push conflicting event later' },
  { value: 'truncate', label: 'Truncate — cut conflicting event short' },
  { value: 'concurrent', label: 'Concurrent — run alongside other events' },
];

// ── TODAY ISO ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return localISODate(new Date());
}

// ── RECURRENCE DAY GUARD ──────────────────────────────────────────────────────

const WEEKDAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Return true when today's weekday is a valid recurrence day for the rule.
 * Used to guard same-day materialisation: a weekly routine set to Wed/Thu/Fri
 * must not materialise immediately if today is Mon.
 */
function isTodayARecurrenceDay(rule: RecurrenceRule): boolean {
  if (rule.frequency === 'daily') return true;
  if (rule.frequency === 'monthly') return true;
  if (rule.frequency === 'weekly') {
    if (!rule.days || rule.days.length === 0) return true;
    const todayKey = WEEKDAY_KEYS[new Date().getDay()];
    return todayKey !== undefined && rule.days.includes(todayKey);
  }
  // custom or unknown — do not block
  return true;
}

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface RoutinePopupProps {
  /** null = add mode; PlannedEvent = edit mode */
  editRoutine: PlannedEvent | null;
  onClose: () => void;
}

// ── FORM FIELD WRAPPER ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 italic">{hint}</p>}
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RoutinePopup({ editRoutine, onClose }: RoutinePopupProps) {
  const setPlannedEvent = useScheduleStore((s) => s.setPlannedEvent);
  const removePlannedEvent = useScheduleStore((s) => s.removePlannedEvent);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);
  const addRoutineRef = useUserStore((s) => s.addRoutineRef);
  const removeRoutineRef = useUserStore((s) => s.removeRoutineRef);

  const isEditMode = editRoutine !== null;

  // ── Build merged template list: prebuilt + user custom ────────────────────
  const allTemplates = useMemo(() => {
    const prebuilt = taskTemplateLibrary.map((t) => ({
      id: t.id ?? t.name,
      name: t.name,
    }));
    const custom = Object.entries(taskTemplates).map(([k, t]) => ({
      id: k,
      name: t.name,
    }));
    // Deduplicate by id — custom shadows prebuilt if same id
    const map = new Map<string, string>();
    for (const t of prebuilt) map.set(t.id, t.name);
    for (const t of custom) map.set(t.id, t.name);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [taskTemplates]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(isEditMode ? editRoutine.name : '');
  const [color, setColor] = useState(isEditMode ? editRoutine.color : COLOUR_SWATCHES[0]);
  const [taskPool, setTaskPool] = useState<string[]>(
    isEditMode ? editRoutine.taskPool : [],
  );
  const [frequency, setFrequency] = useState<RecurrenceFrequency>(
    isEditMode ? editRoutine.recurrenceInterval.frequency : 'daily',
  );
  const [days, setDays] = useState<Weekday[]>(
    isEditMode ? editRoutine.recurrenceInterval.days : [],
  );
  const [interval, setInterval] = useState<number | ''>(
    isEditMode ? editRoutine.recurrenceInterval.interval : 1,
  );
  const [endsOn, setEndsOn] = useState<string>(
    isEditMode && editRoutine.recurrenceInterval.endsOn
      ? editRoutine.recurrenceInterval.endsOn
      : '',
  );
  const [customCondition, setCustomCondition] = useState<string>(
    isEditMode && editRoutine.recurrenceInterval.customCondition
      ? editRoutine.recurrenceInterval.customCondition
      : '',
  );
  const [conflictMode, setConflictMode] = useState<ConflictMode>(
    isEditMode ? editRoutine.conflictMode : 'concurrent',
  );
  const [startTime, setStartTime] = useState(isEditMode ? editRoutine.startTime : '09:00');
  const [endTime, setEndTime] = useState(isEditMode ? editRoutine.endTime : '10:00');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // ── Task pool toggle ──────────────────────────────────────────────────────
  function togglePoolItem(id: string) {
    setTaskPool((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // ── Weekday toggle ────────────────────────────────────────────────────────
  function toggleDay(day: Weekday) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    const today = todayISO();
    const seedDate = isEditMode ? editRoutine.seedDate : today;

    const recurrenceInterval = {
      frequency,
      days: frequency === 'weekly' ? days : [],
      interval: interval === '' ? 1 : interval,
      endsOn: endsOn.trim() || null,
      customCondition: frequency === 'custom' ? (customCondition.trim() || null) : null,
    };

    if (isEditMode) {
      const updated: PlannedEvent = {
        ...editRoutine,
        name: name.trim(),
        color,
        taskPool,
        recurrenceInterval,
        conflictMode,
        startTime,
        endTime,
      };
      setPlannedEvent(updated);
    } else {
      const id = uuidv4();
      const newRoutine: PlannedEvent = {
        id,
        name: name.trim(),
        description: '',
        icon: 'routine',
        color,
        seedDate,
        dieDate: null,
        recurrenceInterval,
        activeState: 'active',
        taskPool,
        taskPoolCursor: 0,
        taskList: [],
        conflictMode,
        startTime,
        endTime,
        location: null,
        sharedWith: null,
        pushReminder: null,
      };

      setPlannedEvent(newRoutine);
      addRoutineRef(id);
      autoCheckQuestItem(STARTER_TEMPLATE_IDS.setupSchedule, 'add_routine');

      // D14 — same-day creation triggers immediate materialisation only when
      // today is a valid recurrence day for this routine's frequency/days filter.
      if (seedDate <= today && isTodayARecurrenceDay(recurrenceInterval)) {
        const currentTemplates = useScheduleStore.getState().taskTemplates;
        materialisePlannedEvent(newRoutine, today, currentTemplates);
      }
    }

    onClose();
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (editRoutine) {
      removePlannedEvent(editRoutine.id);
      storageDelete(storageKey.plannedEvent(editRoutine.id));
      removeRoutineRef(editRoutine.id);
    }
    onClose();
  }

  // ── Input class shared across form controls ───────────────────────────────
  const inputCls =
    'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  const title = isEditMode ? 'Edit Routine' : 'Add Routine';

  return (
    <PopupShell title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pb-2">

        {/* Name */}
        <Field label="Name *">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Morning routine"
            className={inputCls}
          />
        </Field>

        {/* Colour */}
        <Field label="Colour">
          <div className="flex flex-wrap gap-2">
            {COLOUR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={hex}
                onClick={() => setColor(hex)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: hex,
                  borderColor: color === hex ? '#1e293b' : 'transparent',
                }}
              />
            ))}
          </div>
        </Field>

        {/* Time */}
        <div className="flex gap-3">
          <Field label="Start time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="End time">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Task Pool */}
        <Field
          label="Task pool"
          hint="Tasks are drawn from this pool one at a time, cycling through in order."
        >
          <div className="max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md divide-y divide-gray-100 dark:divide-gray-700">
            {allTemplates.length === 0 && (
              <p className="text-xs text-gray-400 italic p-3">No templates available yet.</p>
            )}
            {allTemplates.map(({ id, name: tName }) => (
              <label
                key={id}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={taskPool.includes(id)}
                  onChange={() => togglePoolItem(id)}
                  className="accent-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{tName}</span>
              </label>
            ))}
          </div>
        </Field>

        {/* Recurrence — frequency */}
        <Field label="Recurrence">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurrenceFrequency)}
            className={inputCls}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </Field>

        {/* Days — only for weekly */}
        {frequency === 'weekly' && (
          <Field label="Days">
            <div className="flex gap-1.5 flex-wrap">
              {WEEKDAYS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(key)}
                  className={`w-8 h-8 rounded-full text-xs font-medium border transition-colors ${
                    days.includes(key)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
        )}

        {/* Interval */}
        <Field label="Repeat every (interval)" hint="e.g. 2 = every 2 days/weeks/months">
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(e.target.value === '' ? '' : Number(e.target.value))}
            min={1}
            step={1}
            placeholder="1"
            className={inputCls}
          />
        </Field>

        {/* Custom condition — only for custom frequency */}
        {frequency === 'custom' && (
          <Field label="Custom condition" hint='e.g. "friday-13th", "last-monday-of-month"'>
            <input
              type="text"
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              placeholder="Describe the custom rule"
              className={inputCls}
            />
          </Field>
        )}

        {/* Ends on */}
        <Field label="Ends on (optional)" hint="Leave empty for no end date (indefinite)">
          <input
            type="date"
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
            className={inputCls}
          />
        </Field>

        {/* Conflict mode */}
        <Field label="Conflict mode (D08)">
          <select
            value={conflictMode}
            onChange={(e) => setConflictMode(e.target.value as ConflictMode)}
            className={inputCls}
          >
            {CONFLICT_MODES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>

        {/* Error */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className={`text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                confirmDelete
                  ? 'bg-red-600 text-white'
                  : 'text-red-500 border border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
            >
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Add Routine'}
          </button>
        </div>
      </div>
    </PopupShell>
  );
}
