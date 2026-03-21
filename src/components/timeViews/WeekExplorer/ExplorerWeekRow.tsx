import { ExplorerDayBlock } from './ExplorerDayBlock';
import { getWeekDays, format } from '../../../utils/dateUtils';

interface ExplorerWeekRowProps {
  weekStart: Date;
}

/** One week row in the 57-week explorer. Tapping opens that week in WeekView (UI-07). */
export function ExplorerWeekRow({ weekStart }: ExplorerWeekRowProps) {
  const days = getWeekDays(weekStart);

  return (
    <div className="flex border-b border-gray-100">
      {days.map((day) => (
        <ExplorerDayBlock key={format(day, 'iso')} date={day} />
      ))}
    </div>
  );
}
