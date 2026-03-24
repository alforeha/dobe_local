import { useState, useEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { useSystemStore } from '../../../stores/useSystemStore';
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

  const timePreferences = useSystemStore((s) => s.settings?.timePreferences);
  const [rangeStartH, rangeStartM] = (timePreferences?.explorerView?.startTime ?? '00:00').split(':').map(Number);
  const [rangeEndH,   rangeEndM]   = (timePreferences?.explorerView?.endTime   ?? '23:59').split(':').map(Number);
  const rangeStartMin = (rangeStartH ?? 0) * 60 + (rangeStartM ?? 0);
  const rangeEndMin   = (rangeEndH   ?? 23) * 60 + (rangeEndM   ?? 59);
  const rangeMinutes  = Math.max(1, rangeEndMin - rangeStartMin);

  const nowToRangePct = () => {
    const n = new Date();
    const nowMin = n.getHours() * 60 + n.getMinutes();
    return ((Math.max(rangeStartMin, Math.min(rangeEndMin, nowMin)) - rangeStartMin) / rangeMinutes) * 100;
  };

  const [nowPct, setNowPct] = useState(nowToRangePct);
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => setNowPct(nowToRangePct()), 60_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isToday, rangeStartMin, rangeEndMin, rangeMinutes]);

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
