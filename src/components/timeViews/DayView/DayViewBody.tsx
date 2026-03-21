import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { EventBlock } from './EventBlock';
import { format, hourLabel, isSameDay } from '../../../utils/dateUtils';
import { isOneOffEvent } from '../../../utils/isOneOffEvent';
import type { Event, PlannedEvent } from '../../../types';

interface DayViewBodyProps {
  date: Date;
  onEventOpen: (eventId: string) => void;
  /** Optional — opens OneOffEventPopup for future one-off planned events */
  onEditPlanned?: (plannedId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Returns hours in HH:MM from time string stored as HH:MM */
function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

export function DayViewBody({ date, onEventOpen, onEditPlanned }: DayViewBodyProps) {
  const { activeEvents, historyEvents, plannedEvents } = useScheduleStore(useShallow((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
  })));

  const dateIso = format(date, 'iso');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;
  const isToday = isSameDay(date, today);
  const isFuture = date > today;

  // Collect events for this date
  const dayEvents: Array<Event | PlannedEvent> = [];

  if (isPast || isToday) {
    // Past + present: from active and history
    Object.values(activeEvents).forEach((e) => {
      const ev = e as Event;
      if (ev.startDate === dateIso) dayEvents.push(ev);
    });
    Object.values(historyEvents).forEach((e) => {
      const ev = e as Event;
      if (ev.startDate === dateIso) dayEvents.push(ev);
    });
  } else if (isFuture) {
    // Future: from planned
    Object.values(plannedEvents).forEach((pe) => {
      if (pe.seedDate === dateIso) dayEvents.push(pe);
    });
  }

  const nowHour = isToday ? new Date().getHours() : -1;

  return (
    <div className="flex-1 overflow-y-auto">
      {HOURS.map((h) => {
        // Find events starting in this hour
        const hourEvents = dayEvents.filter((e) => {
          const st = 'startTime' in e ? e.startTime : null;
          return st ? parseHour(st) === h : false;
        });

        return (
          <div key={h} className="relative flex min-h-14 border-b border-gray-100">
            {/* Hour label */}
            <div className="w-12 shrink-0 py-1 pr-2 text-right text-xs text-gray-400">
              {hourLabel(h)}
            </div>

            {/* Content column */}
            <div className="relative flex-1 py-0.5">
              {/* Current time indicator */}
              {h === nowHour && (
                <div className="absolute left-0 right-0 top-0 z-10 border-t-2 border-purple-500" />
              )}

              {/* Event blocks — overlapping events offset horizontally per UI-05 */}
              {hourEvents.map((ev, idx) => {
                const isRealEvent = 'startDate' in ev;
                const isPlanned = !isRealEvent;
                const eventId = ev.id;
                // Past/today real events open the EventOverlay
                // Future one-off planned events open OneOffEventPopup if callback provided
                const plannedEv = isPlanned ? (ev as PlannedEvent) : null;
                const isFutureOneOff =
                  isFuture && plannedEv !== null && isOneOffEvent(plannedEv) && !!onEditPlanned;
                const isInteractive = (!isPlanned && (isPast || isToday)) || isFutureOneOff;
                const handleOpen = isInteractive
                  ? isFutureOneOff
                    ? () => onEditPlanned!(eventId)
                    : () => onEventOpen(eventId)
                  : undefined;
                return (
                  <EventBlock
                    key={eventId}
                    eventId={eventId}
                    name={'name' in ev ? ev.name : '—'}
                    color={'color' in ev ? (ev as PlannedEvent).color : '#9333ea'}
                    startTime={'startTime' in ev ? ev.startTime : ''}
                    endTime={'endTime' in ev ? ev.endTime : ''}
                    taskCount={isPlanned ? (ev as PlannedEvent).taskList.length : 0}
                    taskComplete={0}
                    offsetIndex={idx}
                    interactive={isInteractive}
                    onOpen={handleOpen}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
