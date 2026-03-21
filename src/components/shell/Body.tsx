import { TimeViewContainer } from '../timeViews/TimeViewContainer';
import type { TimeView } from '../timeViews/TimeViewContainer';

interface BodyProps {
  activeView: TimeView;
  onEventOpen: (eventId: string) => void;
  onWeekSelect?: (weekStart: Date) => void;
  weekViewSeed?: Date | null;
}

export function Body({ activeView, onEventOpen, onWeekSelect, weekViewSeed }: BodyProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <TimeViewContainer
        activeView={activeView}
        onEventOpen={onEventOpen}
        onWeekSelect={onWeekSelect}
        weekViewSeed={weekViewSeed}
      />
    </main>
  );
}
