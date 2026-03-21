import type { Event } from '../../../types';
import { format } from '../../../utils/dateUtils';

interface EventOverlayHeaderProps {
  event: Event;
  onClose: () => void;
}

export function EventOverlayHeader({ event, onClose }: EventOverlayHeaderProps) {
  const startDateTime = `${event.startDate} ${event.startTime}`;
  const endDateTime = `${event.endDate} ${event.endTime}`;

  return (
    <div className="flex shrink-0 items-start justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-bold text-gray-900">{event.name}</h2>
        <p className="text-xs text-gray-500">
          {format(new Date(startDateTime.split(' ')[0] + 'T00:00:00'), 'short')} {event.startTime}
          {' → '}
          {format(new Date(endDateTime.split(' ')[0] + 'T00:00:00'), 'short')} {event.endTime}
        </p>
      </div>
      <button
        type="button"
        aria-label="Close event"
        onClick={onClose}
        className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        ✕
      </button>
    </div>
  );
}
