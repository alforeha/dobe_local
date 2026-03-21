import { useScheduleStore } from '../../../stores/useScheduleStore';
import type { TaskType } from '../../../types';

interface TaskBlockProps {
  taskId: string | null;
}

/**
 * Live task representation in EventOverlay.
 * Dynamic shape per TaskType — 15 branches all stubbed at BUILD-time.
 * Full conditional input shapes are BUILD-time per spec §4.
 */
export function TaskBlock({ taskId }: TaskBlockProps) {
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

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{template?.name ?? 'Unknown task'}</span>
        <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
          {taskType}
        </span>
      </div>

      {/* BUILD-time: 15 TaskType input shapes — render type label + input stub */}
      <TaskTypeInputStub taskType={taskType} />
    </div>
  );
}

/** BUILD-time stub: each of the 15 TaskType input shapes */
function TaskTypeInputStub({ taskType }: { taskType: TaskType }) {
  const stubs: Record<TaskType, string> = {
    CHECK: 'Checkbox input — BUILD-time',
    COUNTER: 'Counter stepper — BUILD-time',
    SETS_REPS: 'Sets × Reps × Weight — BUILD-time',
    CIRCUIT: 'Circuit rounds — BUILD-time',
    DURATION: 'Duration timer — BUILD-time',
    TIMER: 'Countdown timer — BUILD-time',
    RATING: 'Rating scale — BUILD-time',
    TEXT: 'Text entry — BUILD-time',
    FORM: 'Multi-field form — BUILD-time',
    CHOICE: 'Choice selector — BUILD-time',
    CHECKLIST: 'Checklist items — BUILD-time',
    SCAN: 'Scan input — BUILD-time',
    LOG: 'Log entry — BUILD-time',
    LOCATION_POINT: 'Location point — BUILD-time',
    LOCATION_TRAIL: 'Location trail — BUILD-time',
  };

  return (
    <div className="rounded bg-gray-50 dark:bg-gray-700 px-3 py-2">
      <p className="text-xs text-gray-400 italic">{stubs[taskType]}</p>
    </div>
  );
}
