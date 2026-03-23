import { useState } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { WeekExplorerHeader } from './WeekExplorerHeader';
import { WeekExplorerSubHeader } from './WeekExplorerSubHeader';
import { WeekExplorerBody } from './WeekExplorerBody';
import { getPrevMonday, addDays } from '../../../utils/dateUtils';

interface WeekExplorerProps {
  onWeekSelect?: (weekStart: Date) => void;
}

/** 57-week rolling window explorer. Seed date defaults to today. */
export function WeekExplorer({ onWeekSelect }: WeekExplorerProps) {
  const appDate = useAppDate();
  // Seed date — user can shift the entire window (UI-07)
  const [seedDate, setSeedDate] = useState(appDate);

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
      <WeekExplorerBody seedDate={seedDate} windowStart={windowStart} onWeekSelect={onWeekSelect} />
    </div>
  );
}
