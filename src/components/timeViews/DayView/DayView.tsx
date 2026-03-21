import { useState } from 'react';
import { DayViewHeader } from './DayViewHeader';
import { DayViewBody } from './DayViewBody';

interface DayViewProps {
  onEventOpen: (eventId: string) => void;
}

export function DayView({ onEventOpen }: DayViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

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

  const goToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <DayViewHeader
        date={currentDate}
        onBack={goBack}
        onForward={goForward}
        onToday={goToday}
      />
      <DayViewBody date={currentDate} onEventOpen={onEventOpen} />
    </div>
  );
}
