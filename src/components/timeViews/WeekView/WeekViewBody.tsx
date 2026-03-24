import { WeekDayBlock } from './WeekDayBlock';
import { getWeekDays } from '../../../utils/dateUtils';

interface WeekViewBodyProps {
  weekStart: Date;
  onDaySelect?: (date: Date) => void;
}

export function WeekViewBody({ weekStart, onDaySelect }: WeekViewBodyProps) {
  const days = getWeekDays(weekStart);

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <div className="flex gap-1 p-2" style={{ minWidth: `${days.length * 240}px` }}>
        {days.map((day) => (
          <WeekDayBlock key={day.toISOString()} date={day} onDaySelect={onDaySelect} />
        ))}
      </div>
    </div>
  );
}
