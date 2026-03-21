import { useState } from 'react';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { EventOverlayHeader } from './EventOverlayHeader';
import { TaskBlock } from './TaskBlock';
import { EventTaskTable } from './EventTaskTable';
import type { Event } from '../../../types';

interface EventOverlayProps {
  eventId: string;
  onClose: () => void;
}

export function EventOverlay({ eventId, onClose }: EventOverlayProps) {
  const activeEvents = useScheduleStore((s) => s.activeEvents);
  const historyEvents = useScheduleStore((s) => s.historyEvents);

  const event = (activeEvents[eventId] ?? historyEvents[eventId]) as Event | undefined;

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    event?.tasks?.[0] ?? null
  );
  const [playMode, setPlayMode] = useState(false);

  if (!event) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
          <p className="text-gray-500">Event not found.</p>
          <button type="button" onClick={onClose} className="mt-4 text-sm text-purple-600">Close</button>
        </div>
      </div>
    );
  }

  const color = '#9333ea'; // default — PlannedEvent.color resolved via ref in full build

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-white dark:bg-gray-900"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <EventOverlayHeader event={event} onClose={onClose} />

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Task block */}
        <div className="shrink-0 border-b border-gray-200 p-3">
          <TaskBlock taskId={selectedTaskId} />
        </div>

        {/* Event task table */}
        <EventTaskTable
          event={event}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          playMode={playMode}
          onTogglePlay={() => setPlayMode((p) => !p)}
        />
      </div>
    </div>
  );
}
