import { useAppDate } from '../../../utils/useAppDate';
import { format } from '../../../utils/dateUtils';

interface DayViewHeaderProps {
  date: Date;
  onBack: () => void;
  onForward: () => void;
}

export function DayViewHeader({ date, onBack, onForward }: DayViewHeaderProps) {
  const appDate = useAppDate();
  const isToday = format(date, 'iso') === format(appDate, 'iso');

  return (
    <div className="flex shrink-0 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
      {/* Back */}
      <button
        type="button"
        aria-label="Previous day"
        onClick={onBack}
        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
      >
        ‹
      </button>

      {/* Centre: date + quick actions placeholder */}
      <div className="flex flex-1 flex-col items-center">
        <span className={`text-sm font-semibold ${isToday ? 'text-purple-600' : 'text-gray-800 dark:text-gray-100'}`}>
          {format(date, 'display')}
        </span>
        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          {/* Weather placeholder — empty per spec (MULTI-USER) */}
          <span className="w-8" />
          {/* GTD icons placeholder */}
          <span className="text-gray-300 dark:text-gray-600">GTD</span>
        </div>
      </div>

      {/* Forward */}
      <button
        type="button"
        aria-label="Next day"
        onClick={onForward}
        className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
      >
        ›
      </button>
    </div>
  );
}
