import { useRef } from 'react';
import { WeekDayBlock } from './WeekDayBlock';
import { getWeekDays } from '../../../utils/dateUtils';
import { useSystemStore } from '../../../stores/useSystemStore';

interface WeekViewBodyProps {
  weekStart: Date;
  onDaySelect?: (date: Date) => void;
}

export function WeekViewBody({ weekStart, onDaySelect }: WeekViewBodyProps) {
  const days = getWeekDays(weekStart);
  const visibleDays = useSystemStore((s) => s.settings?.timePreferences?.weekView?.visibleDays ?? [0, 1, 2, 3, 4, 5, 6]);
  const filteredDays = days.filter((_, i) => visibleDays.includes(i));
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!scrollRef.current) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // already horizontal scroll (trackpad)
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-x-auto" onWheel={handleWheel}>
      <div className="flex h-full w-full gap-1 p-2" style={{ minWidth: `${filteredDays.length * 240}px` }}>
        {filteredDays.map((day) => (
          <WeekDayBlock key={day.toISOString()} date={day} onDaySelect={onDaySelect} />
        ))}
      </div>
    </div>
  );
}
