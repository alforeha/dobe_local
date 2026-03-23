import { useScheduleStore } from '../../../../stores/useScheduleStore';
import { localISODate } from '../../../../utils/dateUtils';
import type { Event } from '../../../../types/event';
import type { PlannedEvent } from '../../../../types/plannedEvent';

interface TrackingEventRowProps {
  id: string;
  name: string;
  time: string;
  color?: string;
  onOpen: () => void;
}

function TrackingEventRow({ name, time, color, onOpen }: TrackingEventRowProps) {
  return (
    <button
      type="button"
      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3"
      onClick={onOpen}
    >
      <span
        className="mt-1 h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: color ?? '#6b7280' }}
      />
      <div>
        <p className="text-sm text-gray-900 dark:text-gray-100">{name}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </button>
  );
}

interface TrackingRoomProps {
  onOpenEvent: (eventId: string) => void;
}

export function TrackingRoom({ onOpenEvent }: TrackingRoomProps) {
  const activeEvents = useScheduleStore((s) => s.activeEvents);
  const plannedEvents = useScheduleStore((s) => s.plannedEvents);

  const ongoing = Object.values(activeEvents).filter(
    (e): e is Event => e.eventType !== 'quickActions',
  );

  const today = localISODate(new Date());
  const upcoming = Object.values(plannedEvents)
    .filter((pe: PlannedEvent) => pe.seedDate > today)
    .sort((a, b) => a.seedDate.localeCompare(b.seedDate))
    .slice(0, 10);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Tracking</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 pt-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          In progress
        </p>
        {ongoing.length === 0 ? (
          <p className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">Nothing active right now.</p>
        ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {ongoing.map((ev) => (
              <TrackingEventRow
                key={ev.id}
                id={ev.id}
                name={ev.name}
                time={`${ev.startTime} – ${ev.endTime}`}
                onOpen={() => onOpenEvent(ev.id)}
              />
            ))}
          </ul>
        )}

        <p className="px-4 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Upcoming
        </p>
        {upcoming.length === 0 ? (
          <p className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">No upcoming events.</p>
        ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcoming.map((pe) => (
              <TrackingEventRow
                key={pe.id}
                id={pe.id}
                name={pe.name}
                time={pe.seedDate}
                color={pe.color}
                onOpen={() => {
                  /* BUILD-TIME: tap planned event → open planned event detail */
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
