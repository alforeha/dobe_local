import { useScheduleStore } from '../../../stores/useScheduleStore';
import { WeekEventCard } from './WeekEventCard';
import { format, isSameDay } from '../../../utils/dateUtils';
import type { Event, PlannedEvent } from '../../../types';

interface WeekDayBlockProps {
  date: Date;
}

export function WeekDayBlock({ date }: WeekDayBlockProps) {
  const { activeEvents, historyEvents, plannedEvents } = useScheduleStore((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;
  const isToday = isSameDay(date, today);
  const isFuture = date > today;
  const dateIso = format(date, 'iso');

  const dayEvents: Array<Event | PlannedEvent> = [];
  if (isPast || isToday) {
    Object.values(activeEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
    Object.values(historyEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
  } else if (isFuture) {
    Object.values(plannedEvents).forEach((pe) => { if (pe.seedDate === dateIso) dayEvents.push(pe); });
  }

  return (
    <div className={`flex min-w-[120px] flex-col rounded-lg border bg-white ${isToday ? 'border-purple-400' : 'border-gray-200'}`}>
      {/* Block header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-2 py-1">
        <span className={`text-xs font-semibold ${isToday ? 'text-purple-600' : 'text-gray-700'}`}>
          {format(date, 'short')}
        </span>
        {/* Weather icon placeholder — empty per spec */}
        <span className="w-4" />
      </div>

      {/* Event cards */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-1">
        {dayEvents.map((ev) => (
          <WeekEventCard
            key={ev.id}
            name={'name' in ev ? ev.name : '—'}
            color={'color' in ev ? (ev as PlannedEvent).color : '#9333ea'}
          />
        ))}
      </div>
    </div>
  );
}
