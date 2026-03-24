import { useAppDate } from '../../../utils/useAppDate';
import { isSameDay } from '../../../utils/dateUtils';

interface ExplorerDayBlockProps {
  date: Date;
  onDaySelect?: (date: Date) => void;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ExplorerDayBlock({ date, onDaySelect }: ExplorerDayBlockProps) {
  const today = useAppDate();
  const isToday = isSameDay(date, today);
  const isFirstOfMonth = date.getDate() === 1;

  return (
    <div
      className={`flex flex-1 flex-col h-36 border-r border-gray-100 dark:border-gray-700 p-0.5 ${isToday ? 'bg-purple-50 dark:bg-purple-900/20' : ''} ${onDaySelect ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/40' : ''}`}
      role={onDaySelect ? 'button' : undefined}
      tabIndex={onDaySelect ? 0 : undefined}
      onClick={(e) => { e.stopPropagation(); onDaySelect?.(date); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onDaySelect?.(date); } }}
    >
      {/* Date label */}
      <span className={`text-[10px] leading-none ${isToday ? 'text-purple-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
        {isFirstOfMonth ? MONTH_NAMES[date.getMonth()] : date.getDate()}
      </span>
    </div>
  );
}
