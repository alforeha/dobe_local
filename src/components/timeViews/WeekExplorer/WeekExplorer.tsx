import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { WeekExplorerHeader } from './WeekExplorerHeader';
import { WeekExplorerSubHeader } from './WeekExplorerSubHeader';
import { WeekExplorerBody } from './WeekExplorerBody';
import { getPrevMonday, addDays } from '../../../utils/dateUtils';

interface WeekExplorerProps {
  onWeekSelect?: (weekStart: Date) => void;
  onDaySelect?: (date: Date) => void;
  todaySignal?: number;
}

/** 57-week rolling window explorer. Seed date defaults to today. */
export function WeekExplorer({ onWeekSelect, onDaySelect, todaySignal }: WeekExplorerProps) {
  const appDate = useAppDate();
  const appDateRef = useRef(appDate);
  // Sync ref after every render so the effect always sees the latest appDate
  useLayoutEffect(() => { appDateRef.current = appDate; });

  // Seed date — user can shift the entire window (UI-07)
  const [seedDate, setSeedDate] = useState(appDate);

  // Reset seed to today when footer tab is tapped while already on explorer view
  useEffect(() => {
    if (todaySignal) setSeedDate(appDateRef.current);
  }, [todaySignal]);

  const windowStart = addDays(getPrevMonday(seedDate), -13 * 7); // -13 weeks
  const windowEnd = addDays(windowStart, 57 * 7 - 1);            // +57 weeks total

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WeekExplorerHeader
        seedDate={seedDate}
        windowStart={windowStart}
        windowEnd={windowEnd}
        onSeedChange={setSeedDate}
      />
      <WeekExplorerSubHeader />
      <WeekExplorerBody seedDate={seedDate} windowStart={windowStart} onWeekSelect={onWeekSelect} onDaySelect={onDaySelect} />
    </div>
  );
}
