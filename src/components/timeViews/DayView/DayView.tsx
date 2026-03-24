import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { DayViewHeader } from './DayViewHeader';
import { DayViewBody } from './DayViewBody';

interface DayViewProps {
  onEventOpen: (eventId: string) => void;
  onEditPlanned?: (plannedId: string) => void;
  todaySignal?: number;
  initialDate?: Date;
}

export function DayView({ onEventOpen, onEditPlanned, todaySignal, initialDate }: DayViewProps) {
  const appDate = useAppDate();
  const appDateRef = useRef(appDate);
  // Sync ref after every render so the effect always sees the latest appDate
  useLayoutEffect(() => { appDateRef.current = appDate; });

  const [currentDate, setCurrentDate] = useState(initialDate ?? appDate);

  const goBack = () =>
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() - 1);
      return n;
    });

  const goForward = () =>
    setCurrentDate((d) => {
      const n = new Date(d);
      n.setDate(n.getDate() + 1);
      return n;
    });

  // Reset to today when footer tab is tapped while already on day view
  useEffect(() => {
    if (todaySignal) setCurrentDate(appDateRef.current);
  }, [todaySignal]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DayViewHeader
        date={currentDate}
        onBack={goBack}
        onForward={goForward}
      />
      <DayViewBody date={currentDate} onEventOpen={onEventOpen} onEditPlanned={onEditPlanned} />
    </div>
  );
}
