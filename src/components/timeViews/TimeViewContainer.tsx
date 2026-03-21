import { DayView } from './DayView/DayView';
import { WeekView } from './WeekView/WeekView';
import { WeekExplorer } from './WeekExplorer/WeekExplorer';

export type TimeView = 'day' | 'week' | 'explorer';

interface TimeViewContainerProps {
  activeView: TimeView;
  onEventOpen: (eventId: string) => void;
  onWeekSelect?: (weekStart: Date) => void;
  weekViewSeed?: Date | null;
  onEditPlanned?: (plannedId: string) => void;
}

/** Single source of truth for active time view. Footer TimeViewTabs dispatches to AppShell which passes here. */
export function TimeViewContainer({ activeView, onEventOpen, onWeekSelect, weekViewSeed, onEditPlanned }: TimeViewContainerProps) {
  return (
    <div className="h-full overflow-hidden">
      {activeView === 'day' && <DayView onEventOpen={onEventOpen} onEditPlanned={onEditPlanned} />}
      {activeView === 'week' && <WeekView initialWeekStart={weekViewSeed ?? undefined} />}
      {activeView === 'explorer' && <WeekExplorer onWeekSelect={onWeekSelect} />}
    </div>
  );
}
