import type { PlannedEvent } from '../../../../../types';
import { PlannedEventBlock } from './PlannedEventBlock';

interface ScheduleRoomBodyProps {
  events: PlannedEvent[];
}

export function ScheduleRoomBody({ events }: ScheduleRoomBodyProps) {
  if (events.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">No routines yet.</p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {events.map((e) => (
        <PlannedEventBlock key={e.id} event={e} />
      ))}
    </div>
  );
}
