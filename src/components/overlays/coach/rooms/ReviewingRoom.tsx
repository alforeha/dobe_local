import { useScheduleStore } from '../../../../stores/useScheduleStore';
import type { Event } from '../../../../types/event';

interface ReviewingStatSurfaceProps {
  onNavigateToDayView: (date: string) => void;
}

function ReviewingStatSurface({ onNavigateToDayView }: ReviewingStatSurfaceProps) {
  const historyEvents = useScheduleStore((s) => s.historyEvents);

  const allEvents = Object.values(historyEvents).filter(
    (e): e is Event => e.eventType !== 'quickActions',
  );

  const byDate = allEvents.reduce<Record<string, number>>((acc, ev) => {
    const d = (ev as Event).startDate;
    acc[d] = (acc[d] ?? 0) + ev.xpAwarded;
    return acc;
  }, {});

  const bestDate = Object.entries(byDate).sort(([, a], [, b]) => b - a)[0];

  if (!bestDate) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
        No completed events yet.
      </div>
    );
  }

  const [date, xp] = bestDate;
  const displayDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      type="button"
      className="w-full text-left px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded"
      onClick={() => onNavigateToDayView(date)}
    >
      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold uppercase tracking-wide">Best day</p>
      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{displayDate}</p>
      <p className="text-xs text-indigo-600 dark:text-indigo-400">+{xp} XP earned</p>
    </button>
  );
}

interface ReviewingIncompleteListProps {
  onOpenEvent: (eventId: string) => void;
}

function ReviewingIncompleteList({ onOpenEvent }: ReviewingIncompleteListProps) {
  const historyEvents = useScheduleStore((s) => s.historyEvents);

  const incomplete = Object.values(historyEvents)
    .filter((e): e is Event => e.eventType !== 'quickActions' && e.completionState === 'pending')
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  if (incomplete.length === 0) {
    return (
      <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">No incomplete past events.</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {incomplete.map((ev) => {
        const display = new Date(ev.startDate).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        return (
          <li key={ev.id}>
            <button
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => onOpenEvent(ev.id)}
            >
              <p className="text-sm text-gray-900 dark:text-gray-100">{ev.name}</p>
              <p className="text-xs text-gray-400">{display}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

interface ReviewingRoomProps {
  onNavigateToDayView: (date: string) => void;
  onOpenEvent: (eventId: string) => void;
}

export function ReviewingRoom({ onNavigateToDayView, onOpenEvent }: ReviewingRoomProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Reviewing</h3>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">
        <ReviewingStatSurface onNavigateToDayView={onNavigateToDayView} />
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 px-0">
            Incomplete events
          </p>
          <ReviewingIncompleteList onOpenEvent={onOpenEvent} />
        </div>
      </div>
    </div>
  );
}
