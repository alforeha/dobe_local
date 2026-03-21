import type { CheckInputFields } from '../../../../types/taskTemplate';
import type { Task } from '../../../../types/task';

interface CheckInputProps {
  inputFields: CheckInputFields;
  task: Task;
  onComplete: (result: Partial<CheckInputFields>) => void;
}

export function CheckInput({ inputFields, task, onComplete }: CheckInputProps) {
  const isComplete = task.completionState === 'complete';

  return (
    <div className="flex items-center gap-3 py-2">
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-300">{inputFields.label}</p>
      <button
        type="button"
        disabled={isComplete}
        onClick={() => onComplete({ label: inputFields.label, note: null })}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
          ${isComplete
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 cursor-default'
            : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }`}
      >
        {isComplete ? '✓ Done' : 'Complete'}
      </button>
    </div>
  );
}
