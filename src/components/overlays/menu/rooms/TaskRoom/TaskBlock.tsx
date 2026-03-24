import type { TaskType, TaskSecondaryTag } from '../../../../../types';
import { resolveIcon } from '../../../../../constants/iconMap';

interface TaskBlockProps {
  templateKey: string;
  name: string;
  icon: string;
  taskType: TaskType;
  secondaryTag: TaskSecondaryTag | null;
  xpTotal: number;
  /** true = user custom template; false = prebuilt read-only */
  isCustom: boolean;
  /** Called when user taps the edit button. Only provided for custom templates. */
  onEdit?: () => void;
}

export function TaskBlock({ name, icon, taskType, secondaryTag, xpTotal, isCustom, onEdit }: TaskBlockProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <span className="w-8 shrink-0 text-xl leading-none text-center" aria-hidden="true">
        {resolveIcon(icon)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{name}</p>
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
      {isCustom ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit task template"
          className="text-xs text-gray-400 hover:text-purple-500 shrink-0 transition-colors px-1"
        >
          Edit
        </button>
      ) : (
        <span
          title="Prebuilt templates are read-only"
          className="text-xs text-gray-300 shrink-0 select-none cursor-default px-1"
          aria-label="Prebuilt template — read-only"
        >
          •••
        </span>
      )}
    </div>
  );
}
