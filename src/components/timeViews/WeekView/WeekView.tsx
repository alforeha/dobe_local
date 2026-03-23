import { useState } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { WeekViewHeader } from './WeekViewHeader';
import { WeekViewBody } from './WeekViewBody';
import { getPrevMonday, addDays } from '../../../utils/dateUtils';

interface WeekViewProps {
  initialWeekStart?: Date;
}

export function WeekView({ initialWeekStart }: WeekViewProps) {
  const appDate = useAppDate();
  const [weekStart, setWeekStart] = useState(() => getPrevMonday(initialWeekStart ?? appDate));

  const goBack = () => setWeekStart((d) => addDays(d, -7));
  const goForward = () => setWeekStart((d) => addDays(d, 7));
  const goThisWeek = () => setWeekStart(getPrevMonday(appDate));

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
