import { useScheduleStore } from '../../../stores/useScheduleStore';
import { completeTask } from '../../../engine/eventExecution';
import { starterTaskTemplates } from '../../../coach/StarterQuestLibrary';
import type { TaskType, InputFields } from '../../../types/taskTemplate';
import { TaskTypeInputRenderer } from './TaskTypeInputRenderer';

interface TaskBlockProps {
  taskId: string | null;
  eventId: string;
  playMode: boolean;
  onTaskComplete: () => void;
  className?: string;
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

export function TaskBlock({ taskId, eventId, playMode, onTaskComplete, className }: TaskBlockProps) {
  const tasks = useScheduleStore((s) => s.tasks);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  if (!taskId) {
    return (
      <div className={`flex items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 ${className ?? 'min-h-16'}`}>
        <p className="text-xs text-gray-400">Select a task to begin</p>
      </div>
    );
  }

  const task = tasks[taskId];
  const template = task
    ? (taskTemplates[task.templateRef] ??
       starterTaskTemplates.find((t) => t.id === task.templateRef) ??
       null)
    : null;
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
    <div className={`flex flex-col rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 ${className ?? ''}`}>
      <div className="mb-2 shrink-0 flex items-start justify-between gap-2">
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

      <div className="flex-1 min-h-0 overflow-hidden">
        <TaskTypeInputRenderer
          taskType={taskType}
          template={template}
          task={task ?? null}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
