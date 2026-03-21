import { useState } from 'react';
import { WeekViewHeader } from './WeekViewHeader';
import { WeekViewBody } from './WeekViewBody';
import { getPrevMonday, addDays } from '../../../utils/dateUtils';

interface WeekViewProps {
  initialWeekStart?: Date;
}

export function WeekView({ initialWeekStart }: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(() => getPrevMonday(initialWeekStart ?? new Date()));

  const goBack = () => setWeekStart((d) => addDays(d, -7));
  const goForward = () => setWeekStart((d) => addDays(d, 7));
  const goThisWeek = () => setWeekStart(getPrevMonday(new Date()));

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <WeekViewHeader
        weekStart={weekStart}
        onBack={goBack}
        onForward={goForward}
        onThisWeek={goThisWeek}
      />
      <WeekViewBody weekStart={weekStart} />
    </div>
  );
}
