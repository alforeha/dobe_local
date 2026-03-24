import { useRef } from 'react';
import { WeekDayBlock } from './WeekDayBlock';
import { getWeekDays } from '../../../utils/dateUtils';

interface WeekViewBodyProps {
  weekStart: Date;
  onDaySelect?: (date: Date) => void;
}

export function WeekViewBody({ weekStart, onDaySelect }: WeekViewBodyProps) {
  const days = getWeekDays(weekStart);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already horizontal scroll (trackpad)
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-x-auto" onWheel={handleWheel}>
      <div className="flex h-full w-full gap-1 p-2" style={{ minWidth: `${days.length * 240}px` }}>
        {days.map((day) => (
          <WeekDayBlock key={day.toISOString()} date={day} onDaySelect={onDaySelect} />
        ))}
      </div>
    </div>
  );
}
