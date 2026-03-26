// ─────────────────────────────────────────
// OneOffEventPopup — ADD / EDIT One-off PlannedEvent
// W18 — SCHEDULE room / DayView.
// A one-off event has recurrence: { frequency:'daily', interval:1, endsOn:seedDate }
// set automatically from the chosen date — no recurrence controls exposed.
// Same-day or past creation triggers immediate materialisation (D14).
// ─────────────────────────────────────────

import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PopupShell } from '../../../../shared/popups/PopupShell';
import { IconPicker } from '../../../../shared/IconPicker';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';

import { materialisePlannedEvent } from '../../../../../engine/materialise';
import { storageDelete, storageKey } from '../../../../../storage';
import { localISODate } from '../../../../../utils/dateUtils';
import type { PlannedEvent, ConflictMode } from '../../../../../types/plannedEvent';

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

const CONFLICT_MODES: { value: ConflictMode; label: string }[] = [
  { value: 'concurrent', label: 'Concurrent — run alongside other events' },
  { value: 'override', label: 'Override — replace conflicting event' },
  { value: 'shift', label: 'Shift — push conflicting event later' },
  { value: 'truncate', label: 'Truncate — cut conflicting event short' },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function todayISO(): string {
  return localISODate(new Date());
}

function addHour(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = ((hours * 60 + minutes + 60) % 1440 + 1440) % 1440;
  const nextHours = Math.floor(totalMinutes / 60);
  const nextMinutes = totalMinutes % 60;
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

function diffDaysInclusive(startIso: string, endIso: string): number {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
}

function formatDateLabel(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface OneOffEventPopupProps {
  /** null = add mode; PlannedEvent = edit mode */
  editEvent: PlannedEvent | null;
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

export function OneOffEventPopup({ editEvent, onClose }: OneOffEventPopupProps) {
  const setPlannedEvent = useScheduleStore((s) => s.setPlannedEvent);
  const removePlannedEvent = useScheduleStore((s) => s.removePlannedEvent);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const isEditMode = editEvent !== null;

  // ── Build template list from user-owned templates only ───────────────────
  const allTemplates = useMemo(() => {
    return Object.entries(taskTemplates)
      .filter(([, t]) => t.isSystem !== true)
      .map(([id, t]) => ({ id, name: t.name }));
  }, [taskTemplates]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(isEditMode ? editEvent.name : '');
  const [iconKey, setIconKey] = useState(isEditMode ? editEvent.icon : 'event');
  const [date, setDate] = useState(isEditMode ? editEvent.seedDate : todayISO());
  const [startTime, setStartTime] = useState(isEditMode ? editEvent.startTime : '09:00');
  const [endDate, setEndDate] = useState(
    isEditMode ? (editEvent.dieDate ?? editEvent.seedDate) : todayISO(),
  );
  const [endTime, setEndTime] = useState(
    isEditMode ? editEvent.endTime : addHour('09:00'),
  );
  const [color, setColor] = useState(isEditMode ? editEvent.color : COLOUR_SWATCHES[0]);
  const [taskPool, setTaskPool] = useState<string[]>(
    isEditMode ? editEvent.taskPool : [],
  );
  const [conflictMode, setConflictMode] = useState<ConflictMode>(
    isEditMode ? editEvent.conflictMode : 'concurrent',
  );
  const [description, setDescription] = useState(isEditMode ? editEvent.description : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');
  const endDateBeforeStart = endDate < date;
  const multiDaySpan = !endDateBeforeStart && endDate > date
    ? diffDaysInclusive(date, endDate)
    : 0;

  // ── Task pool toggle ──────────────────────────────────────────────────────
  function togglePoolItem(id: string) {
    setTaskPool((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!endDate) {
      setError('End date is required.');
      return;
    }
    if (endDateBeforeStart) {
      setError('End date cannot be before start date');
      return;
    }

    const today = todayISO();

    // One-off recurrence: frequency daily, interval 1, endsOn = date (auto-set from date field)
    const recurrenceInterval = {
      frequency: 'daily' as const,
      days: [],
      interval: 1,
      endsOn: date,
      customCondition: null,
    };

    if (isEditMode) {
      const updated: PlannedEvent = {
        ...editEvent,
        name: name.trim(),
        description,
        icon: iconKey,
        color,
        seedDate: date,
        dieDate: endDate,
        recurrenceInterval,
        conflictMode,
        startTime,
        endTime,
        taskPool,
      };
      setPlannedEvent(updated);

      // If updated date is today or in the past, trigger materialisation
      if (date <= today) {
        const currentTemplates = useScheduleStore.getState().taskTemplates;
        materialisePlannedEvent(updated, date <= today ? today : date, currentTemplates);
      }
    } else {
      const id = uuidv4();
      const newEvent: PlannedEvent = {
        id,
        name: name.trim(),
        description,
        icon: iconKey,
        color,
        seedDate: date,
        dieDate: endDate,
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

      setPlannedEvent(newEvent);

      // D14 — same-day or past creation triggers immediate materialisation
      if (date <= today) {
        const currentTemplates = useScheduleStore.getState().taskTemplates;
        materialisePlannedEvent(newEvent, today, currentTemplates);
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
    if (editEvent) {
      removePlannedEvent(editEvent.id);
      storageDelete(storageKey.plannedEvent(editEvent.id));
    }
    onClose();
  }

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls =
    'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  const title = isEditMode ? 'Edit Event' : 'Add One-off Event';

  return (
    <PopupShell title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pb-2">

        {/* Name */}
        <Field label="Name *">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Doctor appointment"
            className={inputCls}
          />
        </Field>

        {/* Date */}
        <Field label="Date *">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              const nextDate = e.target.value;
              setDate(nextDate);
              setEndDate((prev) => (prev < nextDate ? nextDate : prev));
              setError('');
            }}
            className={inputCls}
          />
          {date && (
            <p className="text-xs text-indigo-500 font-medium">
              One-off event — scheduled for {formatDateLabel(date)} only
            </p>
          )}
        </Field>

        {/* Time */}
        <div className="flex gap-3">
          <Field label="Start time *">
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                const nextStartTime = e.target.value;
                setStartTime(nextStartTime);
                if (!isEditMode && endDate === date) {
                  setEndTime(addHour(nextStartTime));
                }
              }}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex gap-3">
          <Field label="End date *">
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setError(''); }}
              min={date}
              className={inputCls}
            />
          </Field>
          <Field label="End time *">
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        {multiDaySpan > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            📅 Multi-day event — spans {multiDaySpan} days
          </p>
        )}
        {endDateBeforeStart && (
          <p className="text-xs text-red-500">End date cannot be before start date</p>
        )}

        {/* Icon */}
        <Field label="Icon">
          <IconPicker value={iconKey} onChange={setIconKey} />
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

        {/* Task Pool */}
        <Field
          label="Task pool"
          hint="Optional — tasks assigned to this event."
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

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes about this event..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
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
            disabled={endDateBeforeStart}
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </PopupShell>
  );
}
