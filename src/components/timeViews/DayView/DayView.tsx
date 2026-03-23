import { useState } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { DayViewHeader } from './DayViewHeader';
import { DayViewBody } from './DayViewBody';

interface DayViewProps {
  onEventOpen: (eventId: string) => void;
  onEditPlanned?: (plannedId: string) => void;
}

export function DayView({ onEventOpen, onEditPlanned }: DayViewProps) {
  const appDate = useAppDate();
  const [currentDate, setCurrentDate] = useState(appDate);

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

  const goToday = () => setCurrentDate(appDate);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DayViewHeader
        date={currentDate}
        onBack={goBack}
        onForward={goForward}
        onToday={goToday}
      />
      <DayViewBody date={currentDate} onEventOpen={onEventOpen} onEditPlanned={onEditPlanned} />
    </div>
  );
}
