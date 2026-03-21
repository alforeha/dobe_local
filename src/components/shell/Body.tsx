import { TimeViewContainer } from '../timeViews/TimeViewContainer';
import type { TimeView } from '../timeViews/TimeViewContainer';

interface BodyProps {
  activeView: TimeView;
  onEventOpen: (eventId: string) => void;
}

export function Body({ activeView, onEventOpen }: BodyProps) {
  return (
    <main className="flex-1 overflow-hidden">
      <TimeViewContainer activeView={activeView} onEventOpen={onEventOpen} />
    </main>
  );
}
