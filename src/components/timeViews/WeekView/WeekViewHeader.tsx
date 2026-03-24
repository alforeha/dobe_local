import { addDays, format } from '../../../utils/dateUtils';
import { useAppDate } from '../../../utils/useAppDate';

interface WeekViewHeaderProps {
  weekStart: Date;
  onBack: () => void;
  onForward: () => void;
}

export function WeekViewHeader({ weekStart, onBack, onForward }: WeekViewHeaderProps) {
  const appDate = useAppDate();
  const weekEnd = addDays(weekStart, 6);
  const isCurrentWeek = appDate >= weekStart && appDate <= weekEnd;
  return (
    <div className="flex shrink-0 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
      <button type="button" aria-label="Previous week" onClick={onBack} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100">‹</button>
      <div className="flex flex-1 flex-col items-center">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{format(weekStart, 'display')}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">→ {format(weekEnd, 'display')}</span>
        {isCurrentWeek && (
          <span className="mt-0.5 text-[10px] font-semibold text-purple-500 dark:text-purple-400 uppercase tracking-wide">This week</span>
        )}
      </div>
      <button type="button" aria-label="Next week" onClick={onForward} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100">›</button>
    </div>
  );
}
