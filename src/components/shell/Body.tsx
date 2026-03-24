import { TimeViewContainer } from '../timeViews/TimeViewContainer';
import type { TimeView } from '../timeViews/TimeViewContainer';

interface TodaySignals {
  day: number;
  week: number;
  explorer: number;
}

interface BodyProps {
  activeView: TimeView;
  onEventOpen: (eventId: string) => void;
  onWeekSelect?: (weekStart: Date) => void;
  weekViewSeed?: Date | null;
  onEditPlanned?: (plannedId: string) => void;
  todaySignals?: TodaySignals;
}

export function Body({ activeView, onEventOpen, onWeekSelect, weekViewSeed, onEditPlanned, todaySignals }: BodyProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <TimeViewContainer
        activeView={activeView}
        onEventOpen={onEventOpen}
        onWeekSelect={onWeekSelect}
        weekViewSeed={weekViewSeed}
        onEditPlanned={onEditPlanned}
        todaySignals={todaySignals}
      />
    </main>
  );
}
