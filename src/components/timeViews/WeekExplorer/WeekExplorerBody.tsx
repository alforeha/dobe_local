import { useRef, useEffect } from 'react';
import { ExplorerWeekRow } from './ExplorerWeekRow';
import { addDays } from '../../../utils/dateUtils';

interface WeekExplorerBodyProps {
  seedDate: Date;
  windowStart: Date;
  onWeekSelect?: (weekStart: Date) => void;
  onDaySelect?: (date: Date) => void;
}

/** Vertical scroll 57-week grid. Each row = Mon–Sun. */
export function WeekExplorerBody({ seedDate, windowStart, onWeekSelect, onDaySelect }: WeekExplorerBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = Array.from({ length: 57 }, (_, i) => addDays(windowStart, i * 7));

  // Scroll so the seed week (always at index 13) is near the top of the viewport
  useEffect(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const rowH = el.scrollHeight / 57;
      el.scrollTop = Math.max(0, rowH * 13 - el.clientHeight / 3);
    });
  }, [seedDate]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {weeks.map((weekStart) => (
        <ExplorerWeekRow
          key={weekStart.toISOString()}
          weekStart={weekStart}
          onSelect={onWeekSelect ? () => onWeekSelect(weekStart) : undefined}
          onDaySelect={onDaySelect}
        />
      ))}
    </div>
  );
}
