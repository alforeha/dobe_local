import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { WeekViewHeader } from './WeekViewHeader';
import { WeekViewBody } from './WeekViewBody';
import { getPrevMonday, addDays } from '../../../utils/dateUtils';

interface WeekViewProps {
  initialWeekStart?: Date;
  todaySignal?: number;
  onDaySelect?: (date: Date) => void;
}

export function WeekView({ initialWeekStart, todaySignal, onDaySelect }: WeekViewProps) {
  const appDate = useAppDate();
  const appDateRef = useRef(appDate);
  // Sync ref after every render so the effect always sees the latest appDate
  useLayoutEffect(() => { appDateRef.current = appDate; });

  const [weekStart, setWeekStart] = useState(() => getPrevMonday(initialWeekStart ?? appDate));

  const goBack = () => setWeekStart((d) => addDays(d, -7));
  const goForward = () => setWeekStart((d) => addDays(d, 7));

  // Reset to current week when footer tab is tapped while already on week view
  useEffect(() => {
    if (todaySignal) setWeekStart(getPrevMonday(appDateRef.current));
  }, [todaySignal]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WeekViewHeader
        weekStart={weekStart}
        onBack={goBack}
        onForward={goForward}
      />
      <WeekViewBody weekStart={weekStart} onDaySelect={onDaySelect} />
    </div>
  );
}
