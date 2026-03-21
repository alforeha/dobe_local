import { useRef } from 'react';
import { ExplorerWeekRow } from './ExplorerWeekRow';
import { addDays } from '../../../utils/dateUtils';

interface WeekExplorerBodyProps {
  seedDate: Date;
  windowStart: Date;
}

/** Vertical scroll 57-week grid. Each row = Mon–Sun. */
export function WeekExplorerBody({ windowStart }: WeekExplorerBodyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const weeks = Array.from({ length: 57 }, (_, i) => addDays(windowStart, i * 7));

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {weeks.map((weekStart) => (
        <ExplorerWeekRow key={weekStart.toISOString()} weekStart={weekStart} />
      ))}
    </div>
  );
}
