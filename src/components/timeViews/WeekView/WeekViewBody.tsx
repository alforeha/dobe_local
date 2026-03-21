import { WeekDayBlock } from './WeekDayBlock';
import { getWeekDays } from '../../../utils/dateUtils';

interface WeekViewBodyProps {
  weekStart: Date;
}

export function WeekViewBody({ weekStart }: WeekViewBodyProps) {
  const days = getWeekDays(weekStart);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full gap-1 p-2" style={{ minWidth: `${days.length * 120}px` }}>
        {days.map((day) => (
          <WeekDayBlock key={day.toISOString()} date={day} />
        ))}
      </div>
    </div>
  );
}
