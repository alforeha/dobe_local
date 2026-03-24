import { useState, useEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { isSameDay } from '../../../utils/dateUtils';

interface ExplorerDayBlockProps {
  date: Date;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ExplorerDayBlock({ date }: ExplorerDayBlockProps) {
  const today = useAppDate();
  const isToday = isSameDay(date, today);
  const isPast = !isToday && date < today;
  const isFirstOfMonth = date.getDate() === 1;

  const [nowPct, setNowPct] = useState(() => {
    const n = new Date();
    return ((n.getHours() * 60 + n.getMinutes()) / (24 * 60)) * 100;
  });
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => {
      const n = new Date();
      setNowPct(((n.getHours() * 60 + n.getMinutes()) / (24 * 60)) * 100);
    }, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  return (
    <div className={`relative flex flex-1 flex-col h-36 border-r border-gray-100 dark:border-gray-700 p-0.5 ${isToday ? 'bg-purple-50 dark:bg-purple-900/20' : isPast ? 'opacity-40' : ''}`}>
      {/* Date label */}
      <span className={`text-[10px] leading-none ${isToday ? 'text-purple-600 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
        {isFirstOfMonth ? MONTH_NAMES[date.getMonth()] : date.getDate()}
      </span>
      {/* Current time line */}
      {isToday && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-purple-500 z-10 pointer-events-none"
          style={{ top: `${nowPct}%` }}
        />
      )}
    </div>
  );
}
