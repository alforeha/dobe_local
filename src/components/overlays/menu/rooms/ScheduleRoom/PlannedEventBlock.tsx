import type { PlannedEvent } from '../../../../../types';

interface PlannedEventBlockProps {
  event: PlannedEvent;
}

export function PlannedEventBlock({ event }: PlannedEventBlockProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <div
        className="w-2 h-8 rounded-full shrink-0"
        style={{ backgroundColor: event.color || '#6366f1' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{event.name}</p>
        <p className="text-xs text-gray-400">
          {event.startTime} – {event.endTime} · {event.recurrenceInterval.frequency}
        </p>
      </div>
      {event.activeState === 'sleep' && (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded shrink-0">
          paused
        </span>
      )}
      <button type="button" className="text-xs text-blue-400 shrink-0">
        Edit
      </button>
    </div>
  );
}
