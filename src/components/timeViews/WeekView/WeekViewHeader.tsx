import { addDays, format } from '../../../utils/dateUtils';

interface WeekViewHeaderProps {
  weekStart: Date;
  onBack: () => void;
  onForward: () => void;
  onThisWeek: () => void;
}

export function WeekViewHeader({ weekStart, onBack, onForward, onThisWeek }: WeekViewHeaderProps) {
  const weekEnd = addDays(weekStart, 6);
  return (
    <div className="flex shrink-0 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
      <button type="button" aria-label="Previous week" onClick={onBack} className="p-1 text-gray-500">‹</button>
      <button
        type="button"
        onClick={onThisWeek}
        className="flex flex-1 flex-col items-center"
      >
        <span className="text-sm font-semibold text-gray-800">{format(weekStart, 'display')}</span>
        <span className="text-xs text-gray-500">→ {format(weekEnd, 'display')}</span>
      </button>
      <button type="button" aria-label="Next week" onClick={onForward} className="p-1 text-gray-500">›</button>
    </div>
  );
}
