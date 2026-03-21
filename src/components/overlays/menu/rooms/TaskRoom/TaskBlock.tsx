import type { TaskType, TaskSecondaryTag } from '../../../../../types';

interface TaskBlockProps {
  templateKey: string;
  name: string;
  taskType: TaskType;
  secondaryTag: TaskSecondaryTag | null;
  xpTotal: number;
}

export function TaskBlock({ name, taskType, secondaryTag, xpTotal }: TaskBlockProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-gray-400">{taskType}</span>
          {secondaryTag && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
              {secondaryTag}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs font-medium text-amber-500 shrink-0">+{xpTotal} XP</span>
      {/* BUILD-TIME: quick-complete, edit, favourite actions */}
      <button type="button" className="text-gray-300 text-sm shrink-0">•••</button>
    </div>
  );
}
