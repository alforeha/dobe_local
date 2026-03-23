import { useAppDate } from '../../../utils/useAppDate';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { format, isSameDay } from '../../../utils/dateUtils';
import type { Event, PlannedEvent } from '../../../types';

interface ExplorerDayBlockProps {
  date: Date;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function ExplorerDayBlock({ date }: ExplorerDayBlockProps) {
  const { activeEvents, historyEvents, plannedEvents } = useScheduleStore(useShallow((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
  })));

  const today = useAppDate();
  const isPast = date < today;
  const isToday = isSameDay(date, today);
  const isFuture = date > today;
  const dateIso = format(date, 'iso');
  const isFirstOfMonth = date.getDate() === 1;

  const dayEvents: Array<Event | PlannedEvent> = [];
  if (isPast || isToday) {
    Object.values(activeEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
    Object.values(historyEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
  } else if (isFuture) {
    Object.values(plannedEvents).forEach((pe) => { if (pe.seedDate === dateIso) dayEvents.push(pe); });
  }

  return (
    <div className={`flex flex-1 flex-col min-h-12 border-r border-gray-100 p-0.5 ${isToday ? 'bg-purple-50' : ''}`}>
      {/* Block header */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] leading-none ${isToday ? 'text-purple-600 font-bold' : 'text-gray-500'}`}>
          {isFirstOfMonth ? MONTH_NAMES[date.getMonth()] : date.getDate()}
        </span>
        {/* Weather placeholder — empty per spec */}
      </div>

      {/* Colour-only event cards — no name */}
      <div className="flex flex-col gap-px mt-0.5">
        {dayEvents.map((ev) => (
          <div
            key={ev.id}
            className="h-1.5 w-full rounded-sm"
            style={{ backgroundColor: 'color' in ev ? (ev as PlannedEvent).color : '#9333ea' }}
          />
        ))}
      </div>
    </div>
  );
}
