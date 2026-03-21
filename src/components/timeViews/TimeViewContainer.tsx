import { DayView } from './DayView/DayView';
import { WeekView } from './WeekView/WeekView';
import { WeekExplorer } from './WeekExplorer/WeekExplorer';

export type TimeView = 'day' | 'week' | 'explorer';

interface TimeViewContainerProps {
  activeView: TimeView;
  onEventOpen: (eventId: string) => void;
}

/** Single source of truth for active time view. Footer TimeViewTabs dispatches to AppShell which passes here. */
export function TimeViewContainer({ activeView, onEventOpen }: TimeViewContainerProps) {
  return (
    <div className="h-full overflow-hidden">
      {activeView === 'day' && <DayView onEventOpen={onEventOpen} />}
      {activeView === 'week' && <WeekView />}
      {activeView === 'explorer' && <WeekExplorer />}
    </div>
  );
}
