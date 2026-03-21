// ─────────────────────────────────────────
// TaskTemplatePopup — ADD / EDIT custom TaskTemplate
// Renders inside the Menu overlay via PopupShell.
// inputFields set to sensible BUILD-TIME defaults per taskType on save.
// Full inputFields editor is FUTURE SCOPE.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PopupShell } from '../../../../shared/popups/PopupShell';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import type {
  TaskTemplate,
  TaskType,
  TaskSecondaryTag,
  InputFields,
} from '../../../../../types';
import type { StatGroupKey } from '../../../../../types/user';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const TASK_TYPES: TaskType[] = [
  'CHECK',
  'COUNTER',
  'SETS_REPS',
  'CIRCUIT',
  'DURATION',
  'TIMER',
  'RATING',
  'TEXT',
  'FORM',
  'CHOICE',
  'CHECKLIST',
  'SCAN',
  'LOG',
  'LOCATION_POINT',
  'LOCATION_TRAIL',
];

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  CHECK: 'Check (simple tick)',
  COUNTER: 'Counter (count toward target)',
  SETS_REPS: 'Sets & Reps (weights)',
  CIRCUIT: 'Circuit (multi-exercise)',
  DURATION: 'Duration (timed activity)',
  TIMER: 'Timer (countdown)',
  RATING: 'Rating (scale score)',
  TEXT: 'Text (free-text response)',
  FORM: 'Form (multi-field)',
  CHOICE: 'Choice (select option)',
  CHECKLIST: 'Checklist (tick items)',
  SCAN: 'Scan (barcode/QR)',
  LOG: 'Log (open entry)',
  LOCATION_POINT: 'Location Point (pin drop)',
  LOCATION_TRAIL: 'Location Trail (route track)',
};

const SECONDARY_TAGS: TaskSecondaryTag[] = [
  'fitness',
  'nutrition',
  'health',
  'mindfulness',
  'home',
  'finance',
  'admin',
  'learning',
  'social',
  'work',
];

const STAT_GROUPS: { key: StatGroupKey; label: string }[] = [
  { key: 'health', label: 'Health' },
  { key: 'strength', label: 'Strength' },
  { key: 'agility', label: 'Agility' },
  { key: 'defense', label: 'Defense' },
  { key: 'charisma', label: 'Charisma' },
  { key: 'wisdom', label: 'Wisdom' },
];

// ── DEFAULT inputFields per TaskType (BUILD-TIME STUB — D41) ──────────────────
// Full inputFields editor is FUTURE SCOPE. On save, sensible defaults are applied.

function defaultInputFields(taskType: TaskType): InputFields {
  switch (taskType) {
    case 'CHECK':
      return { label: 'Done' };
    case 'COUNTER':
      return { target: 10, unit: 'count', step: 1 };
    case 'SETS_REPS':
      return { sets: 3, reps: 10, weight: null, weightUnit: 'kg', restAfter: null, dropSet: false };
    case 'CIRCUIT':
      return { exercises: ['Exercise 1', 'Exercise 2'], rounds: 3, restBetweenRounds: null };
    case 'DURATION':
      return { targetDuration: 1800, unit: 'seconds' };
    case 'TIMER':
      return { countdownFrom: 300 };
    case 'RATING':
      return { scale: 5, label: 'Rate this' };
    case 'TEXT':
      return { prompt: 'Enter your response', maxLength: null };
    case 'FORM':
      return { fields: [] };
    case 'CHOICE':
      return { options: ['Option A', 'Option B'], multiSelect: false };
    case 'CHECKLIST':
      return { items: [], requireAll: false };
    case 'SCAN':
      return { scanType: 'barcode' };
    case 'LOG':
      return { prompt: null };
    case 'LOCATION_POINT':
      return { label: 'Mark location', captureAccuracy: true };
    case 'LOCATION_TRAIL':
      return { label: 'Record trail', captureInterval: null };
  }
}

// ── XP AWARD BUILDER ─────────────────────────────────────────────────────────
// D48: all XP goes to the selected stat group. Other groups stay at 0.

function buildXpAward(statGroup: StatGroupKey, xpValue: number) {
  return {
    health: 0,
    strength: 0,
    agility: 0,
    defense: 0,
    charisma: 0,
    wisdom: 0,
    [statGroup]: xpValue,
  };
}

// ── TYPES ─────────────────────────────────────────────────────────────────────

interface TaskTemplatePopupProps {
  /** If provided, editing an existing custom template. null = add mode. */
  editKey: string | null;
  /** Existing template data when in edit mode. */
  editTemplate: TaskTemplate | null;
  onClose: () => void;
}

// ── FORM FIELD ────────────────────────────────────────────────────────────────

interface FormField {
  label: string;
  className?: string;
  hint?: string;
  children: React.ReactNode;
}

function Field({ label, hint, children }: FormField) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 italic">{hint}</p>}
    </div>
  );
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function TaskTemplatePopup({ editKey, editTemplate, onClose }: TaskTemplatePopupProps) {
  const setTaskTemplate = useScheduleStore((s) => s.setTaskTemplate);
  const removeTaskTemplate = useScheduleStore((s) => s.removeTaskTemplate);
  const addTaskTemplateRef = useUserStore((s) => s.addTaskTemplateRef);
  const removeTaskTemplateRef = useUserStore((s) => s.removeTaskTemplateRef);

  const isEditMode = editKey !== null && editTemplate !== null;

  // ── Determine initial statGroup from existing xpAward (edit mode)
  const initialStatGroup: StatGroupKey = (() => {
    if (!isEditMode || !editTemplate) return 'health';
    const a = editTemplate.xpAward;
    const groups: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];
    const dominant = groups.find((g) => a[g] > 0);
    return dominant ?? 'health';
  })();

  const initialXpValue = isEditMode && editTemplate
    ? editTemplate.xpAward[initialStatGroup]
    : 30;

  // ── Form state
  const [name, setName] = useState(isEditMode && editTemplate ? editTemplate.name : '');
  const [taskType, setTaskType] = useState<TaskType>(
    isEditMode && editTemplate ? editTemplate.taskType : 'CHECK',
  );
  const [secondaryTag, setSecondaryTag] = useState<TaskSecondaryTag | ''>( 
    isEditMode && editTemplate ? (editTemplate.secondaryTag ?? '') : '',
  );
  const [statGroup, setStatGroup] = useState<StatGroupKey>(initialStatGroup);
  const [xpValue, setXpValue] = useState<number | ''>(initialXpValue);
  const [cooldown, setCooldown] = useState<number | ''>(
    isEditMode && editTemplate && editTemplate.cooldown !== null ? editTemplate.cooldown : '',
  );
  const [description, setDescription] = useState(
    isEditMode && editTemplate ? editTemplate.description : '',
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // ── Handlers
  function handleSave() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (xpValue === '' || xpValue <= 0) {
      setError('XP value must be greater than 0.');
      return;
    }

    const template: TaskTemplate = {
      name: name.trim(),
      description: description.trim(),
      icon: taskType.toLowerCase(),
      taskType,
      secondaryTag: secondaryTag === '' ? null : secondaryTag,
      inputFields: defaultInputFields(taskType),
      xpAward: buildXpAward(statGroup, xpValue),
      cooldown: cooldown === '' ? null : cooldown,
      media: null,
      items: [],
    };

    if (isEditMode && editKey) {
      // Edit: preserve id and update in store
      const updated: TaskTemplate = { ...template, id: editTemplate?.id };
      setTaskTemplate(editKey, updated);
    } else {
      // Add: generate UUID, write to schedule store and user ref list
      const id = uuidv4();
      setTaskTemplate(id, template);
      addTaskTemplateRef(id);
    }

    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (editKey) {
      removeTaskTemplate(editKey);
      removeTaskTemplateRef(editKey);
    }
    onClose();
  }

  const title = isEditMode ? 'Edit Task Template' : 'Add Task Template';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <PopupShell title={title} onClose={onClose}>
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pb-2">

        {/* Name */}
        <Field label="Name *">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="e.g. Morning walk"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </Field>

        {/* Task Type */}
        <Field label="Task Type *">
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as TaskType)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>{TASK_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </Field>

        {/* Secondary Tag */}
        <Field label="Category (optional)">
          <select
            value={secondaryTag}
            onChange={(e) => setSecondaryTag(e.target.value as TaskSecondaryTag | '')}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="">— None —</option>
            {SECONDARY_TAGS.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </Field>

        {/* Stat Group */}
        <Field label="Stat Group *">
          <select
            value={statGroup}
            onChange={(e) => setStatGroup(e.target.value as StatGroupKey)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {STAT_GROUPS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </Field>

        {/* XP Value */}
        <Field
          label="XP Value *"
          hint="Suggested: light 20–30 • standard 30–50 • physical 50–80 • complex 80–120"
        >
          <input
            type="number"
            value={xpValue}
            onChange={(e) => {
              setXpValue(e.target.value === '' ? '' : Number(e.target.value));
              setError('');
            }}
            placeholder="e.g. 30"
            min={1}
            max={500}
            step={5}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </Field>

        {/* Cooldown */}
        <Field label="Cooldown (minutes, optional)">
          <input
            type="number"
            value={cooldown}
            onChange={(e) => setCooldown(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 60 — leave empty for no cooldown"
            min={1}
            step={1}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </Field>

        {/* Description */}
        <Field label="Description (optional)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of what this task involves"
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 dark:bg-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </Field>

        {/* inputFields editor — BUILD-TIME stub */}
        <p className="text-xs text-gray-400 italic">
          Input fields are set automatically based on the chosen task type. Full editor — future scope.
        </p>

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
            className="text-sm px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Add Template'}
          </button>
        </div>
      </div>
    </PopupShell>
  );
}
