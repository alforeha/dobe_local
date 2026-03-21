import { useScheduleStore } from '../../../stores/useScheduleStore';
import { completeTask } from '../../../engine/eventExecution';
import type { TaskType, InputFields, CheckInputFields, CounterInputFields, RatingInputFields, TextInputFields, ChoiceInputFields, ChecklistInputFields, LogInputFields, SetsRepsInputFields, CircuitInputFields, DurationInputFields, TimerInputFields, FormInputFields, ScanInputFields, LocationPointInputFields, LocationTrailInputFields } from '../../../types/taskTemplate';
import { CheckInput } from './inputs/CheckInput';
import { CounterInput } from './inputs/CounterInput';
import { RatingInput } from './inputs/RatingInput';
import { TextInput } from './inputs/TextInput';
import { ChoiceInput } from './inputs/ChoiceInput';
import { ChecklistInput } from './inputs/ChecklistInput';
import { LogInput } from './inputs/LogInput';
import { SetsRepsInput } from './inputs/SetsRepsInput';
import { CircuitInput } from './inputs/CircuitInput';
import { DurationInput } from './inputs/DurationInput';
import { TimerInput } from './inputs/TimerInput';
import { FormInput } from './inputs/FormInput';
import { ScanInput } from './inputs/ScanInput';
import { LocationPointInput } from './inputs/LocationPointInput';
import { LocationTrailInput } from './inputs/LocationTrailInput';

interface TaskBlockProps {
  taskId: string | null;
  eventId: string;
  playMode: boolean;
  onTaskComplete: () => void;
}

const SECONDARY_TAG_COLOURS: Record<string, string> = {
  fitness: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  nutrition: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  health: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  mindfulness: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  home: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  admin: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  learning: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  work: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

/**
 * Live task representation in EventOverlay.
 * Renders the correct input shape per TaskType and fires completeTask() on completion.
 */
export function TaskBlock({ taskId, eventId, playMode, onTaskComplete }: TaskBlockProps) {
  const tasks = useScheduleStore((s) => s.tasks);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  if (!taskId) {
    return (
      <div className="flex min-h-16 items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-400">Select a task to begin</p>
      </div>
    );
  }

  const task = tasks[taskId];
  const template = task ? taskTemplates[task.templateRef] : null;
  const taskType: TaskType = template?.taskType ?? 'CHECK';
  const secondaryTag = task?.secondaryTag ?? template?.secondaryTag ?? null;

  const handleComplete = (resultFields: Partial<InputFields>) => {
    if (!task || task.completionState === 'complete') return;
    completeTask(taskId, eventId, { resultFields });
    if (playMode) onTaskComplete();
  };

  const tagColour = secondaryTag
    ? (SECONDARY_TAG_COLOURS[secondaryTag] ?? 'bg-gray-100 text-gray-600')
    : null;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {template?.name ?? 'Unknown task'}
        </span>
        <div className="flex shrink-0 flex-wrap gap-1">
          {secondaryTag && (
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${tagColour}`}>
              {secondaryTag}
            </span>
          )}
          <span className="rounded bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 text-xs font-medium text-purple-700 dark:text-purple-300">
            {taskType}
          </span>
        </div>
      </div>

      {/* Input body */}
      <TaskTypeInput
        taskType={taskType}
        template={template}
        task={task ?? null}
        onComplete={handleComplete}
      />
    </div>
  );
}

// ── INPUT DISPATCHER ──────────────────────────────────────────────────────────

interface TaskTypeInputProps {
  taskType: TaskType;
  template: ReturnType<typeof useScheduleStore.getState>['taskTemplates'][string] | null | undefined;
  task: ReturnType<typeof useScheduleStore.getState>['tasks'][string] | null;
  onComplete: (result: Partial<InputFields>) => void;
}

function TaskTypeInput({ taskType, template, task, onComplete }: TaskTypeInputProps) {
  if (!task || !template) {
    return (
      <div className="rounded bg-gray-50 dark:bg-gray-700 px-3 py-2">
        <p className="text-xs text-gray-400 italic">Task data not available</p>
      </div>
    );
  }

  switch (taskType) {
    case 'CHECK':
      return (
        <CheckInput
          inputFields={template.inputFields as CheckInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<CheckInputFields>) => void}
        />
      );
    case 'COUNTER':
      return (
        <CounterInput
          inputFields={template.inputFields as CounterInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<CounterInputFields>) => void}
        />
      );
    case 'RATING':
      return (
        <RatingInput
          inputFields={template.inputFields as RatingInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<RatingInputFields>) => void}
        />
      );
    case 'TEXT':
      return (
        <TextInput
          inputFields={template.inputFields as TextInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<TextInputFields>) => void}
        />
      );
    case 'CHOICE':
      return (
        <ChoiceInput
          inputFields={template.inputFields as ChoiceInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<ChoiceInputFields>) => void}
        />
      );
    case 'CHECKLIST':
      return (
        <ChecklistInput
          inputFields={template.inputFields as ChecklistInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<ChecklistInputFields>) => void}
        />
      );
    case 'LOG':
      return (
        <LogInput
          inputFields={template.inputFields as LogInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<LogInputFields>) => void}
        />
      );
    case 'SETS_REPS':
      return (
        <SetsRepsInput
          inputFields={template.inputFields as SetsRepsInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<SetsRepsInputFields>) => void}
        />
      );
    case 'CIRCUIT':
      return (
        <CircuitInput
          inputFields={template.inputFields as CircuitInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<CircuitInputFields>) => void}
        />
      );
    case 'DURATION':
      return (
        <DurationInput
          inputFields={template.inputFields as DurationInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<DurationInputFields>) => void}
        />
      );
    case 'TIMER':
      return (
        <TimerInput
          inputFields={template.inputFields as TimerInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<TimerInputFields>) => void}
        />
      );
    case 'FORM':
      return (
        <FormInput
          inputFields={template.inputFields as FormInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<FormInputFields>) => void}
        />
      );
    case 'SCAN':
      return (
        <ScanInput
          inputFields={template.inputFields as ScanInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<ScanInputFields>) => void}
        />
      );
    case 'LOCATION_POINT':
      return (
        <LocationPointInput
          inputFields={template.inputFields as LocationPointInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<LocationPointInputFields>) => void}
        />
      );
    case 'LOCATION_TRAIL':
      return (
        <LocationTrailInput
          inputFields={template.inputFields as LocationTrailInputFields}
          task={task}
          onComplete={onComplete as (r: Partial<LocationTrailInputFields>) => void}
        />
      );
    default:
      return (
        <div className="rounded bg-gray-50 dark:bg-gray-700 px-3 py-2">
          <p className="text-xs text-gray-400 italic">{taskType} — input shape not yet implemented</p>
        </div>
      );
  }
}

