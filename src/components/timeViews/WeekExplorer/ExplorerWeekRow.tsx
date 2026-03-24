import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { ExplorerDayBlock } from './ExplorerDayBlock';
import { getWeekDays, format, addDays } from '../../../utils/dateUtils';
import { isPlannedEventDue } from '../../../engine/rollover';
import { useAppDate } from '../../../utils/useAppDate';
import type { Event } from '../../../types';

interface ExplorerWeekRowProps {
  weekStart: Date;
  onSelect?: () => void;
  onDaySelect?: (date: Date) => void;
}

/** One week row in the 57-week explorer. Tapping opens that week in WeekView (UI-07). */
export function ExplorerWeekRow({ weekStart, onSelect, onDaySelect }: ExplorerWeekRowProps) {
  const days = getWeekDays(weekStart);
  const today = useAppDate();

  const { activeEvents, historyEvents, plannedEvents } = useScheduleStore(useShallow((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
  })));

  // Collect all events for Mon–Sun of this week as color blocks
  interface ColorBlock { id: string; color: string; dayOfWeek: number; durationDays: number; }
  const blocks: ColorBlock[] = [];

  days.forEach((day, dayOfWeek) => {
    const dateIso = format(day, 'iso');
    const isPastOrToday = day <= today;

    if (isPastOrToday) {
      Object.values(activeEvents).forEach((e) => {
        const ev = e as Event;
        if (ev.startDate === dateIso) {
          const start = new Date(ev.startDate);
          const end = new Date(ev.endDate);
          const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
          const color = ev.color ?? (ev.plannedEventRef ? (plannedEvents[ev.plannedEventRef]?.color ?? '#9333ea') : '#9333ea');
          blocks.push({ id: `a-${ev.id}`, color, dayOfWeek, durationDays });
        }
      });
      Object.values(historyEvents).forEach((e) => {
        const ev = e as Event;
        if (ev.startDate === dateIso) {
          const start = new Date(ev.startDate);
          const end = new Date(ev.endDate);
          const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
          const color = ev.color ?? (ev.plannedEventRef ? (plannedEvents[ev.plannedEventRef]?.color ?? '#9333ea') : '#9333ea');
          blocks.push({ id: `h-${ev.id}`, color, dayOfWeek, durationDays });
        }
      });
    } else {
      Object.values(plannedEvents).forEach((pe) => {
        if (isPlannedEventDue(pe, dateIso)) {
          blocks.push({ id: `p-${pe.id}-${dayOfWeek}`, color: pe.color, dayOfWeek, durationDays: 1 });
        }
      });
    }
  });

  // Week end boundary for saturday (index 6)
  const weekEndIso = format(addDays(weekStart, 6), 'iso');
  void weekEndIso; // used for future reference if needed

  return (
    <div
      className="relative flex border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-36"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(); }}
    >
      {/* Day label columns */}
      {days.map((day) => (
        <ExplorerDayBlock key={format(day, 'iso')} date={day} onDaySelect={onDaySelect} />
      ))}

      {/* Absolute color stripe blocks — positioned by day of week */}
      {blocks.map((block) => {
        const leftPercent = (block.dayOfWeek / 7) * 100;
        const widthPercent = Math.max((1 / 7) * 100, (block.durationDays / 7) * 100);
        return (
          <div
            key={block.id}
            className="absolute h-2 rounded-sm pointer-events-none"
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              top: 28,
              backgroundColor: block.color,
            }}
          />
        );
      })}
    </div>
  );
}
