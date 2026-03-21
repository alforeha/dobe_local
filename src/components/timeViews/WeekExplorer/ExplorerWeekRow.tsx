import { ExplorerDayBlock } from './ExplorerDayBlock';
import { getWeekDays, format } from '../../../utils/dateUtils';

interface ExplorerWeekRowProps {
  weekStart: Date;
  onSelect?: () => void;
}

/** One week row in the 57-week explorer. Tapping opens that week in WeekView (UI-07). */
export function ExplorerWeekRow({ weekStart, onSelect }: ExplorerWeekRowProps) {
  const days = getWeekDays(weekStart);

  return (
    <div
      className="flex border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(); }}
    >
      {days.map((day) => (
        <ExplorerDayBlock key={format(day, 'iso')} date={day} />
      ))}
    </div>
  );
}
