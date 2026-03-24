import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { WeekEventCard } from './WeekEventCard';
import { format, isSameDay } from '../../../utils/dateUtils';
import { isPlannedEventDue } from '../../../engine/rollover';
import type { Event, PlannedEvent } from '../../../types';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

/** Pixels per hour in the week grid */
const HOUR_HEIGHT_PX = 60;
/** Minimum event card height — enough to show the event name */
const MIN_EVENT_HEIGHT = 24;
/** Total grid height: 24 hours */
const GRID_HEIGHT = 24 * HOUR_HEIGHT_PX;

function parseMinutes(time: string): number {
  if (!time) return 0;
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

interface LayoutItem {
  ev: Event | PlannedEvent;
  topPx: number;
  heightPx: number;
  colIndex: number;
  colCount: number;
  colSpan: number;
}

function computeWeekDayLayout(events: Array<Event | PlannedEvent>): LayoutItem[] {
  if (events.length === 0) return [];

  const parsed = events.map((ev) => {
    const startMin = parseMinutes((ev as { startTime?: string }).startTime ?? '00:00');
    const rawEnd = parseMinutes((ev as { endTime?: string }).endTime ?? '01:00');
    const endMin = rawEnd > startMin ? rawEnd : startMin + 15;
    return { ev, startMin, endMin };
  });

  parsed.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const n = parsed.length;

  // Build overlap clusters (connected components)
  const clusterIdx = new Array<number>(n).fill(-1);
  const clusters: number[][] = [];
  for (let i = 0; i < n; i++) {
    if (clusterIdx[i] !== -1) continue;
    const clusterId = clusters.length;
    const members: number[] = [i];
    clusterIdx[i] = clusterId;
    for (let qi = 0; qi < members.length; qi++) {
      const a = parsed[members[qi]];
      for (let k = 0; k < n; k++) {
        if (clusterIdx[k] !== -1) continue;
        const b = parsed[k];
        if (a.startMin < b.endMin && b.startMin < a.endMin) {
          clusterIdx[k] = clusterId;
          members.push(k);
        }
      }
    }
    clusters.push(members);
  }

  // Greedy column assignment within each cluster
  const colOf = new Array<number>(n).fill(0);
  const colCountOf = new Array<number>(n).fill(1);
  for (const members of clusters) {
    const sorted = [...members].sort((a, b) => parsed[a].startMin - parsed[b].startMin);
    const colEnds: number[] = [];
    for (const idx of sorted) {
      const s = parsed[idx].startMin;
      let col = colEnds.findIndex((et) => et <= s);
      if (col === -1) { col = colEnds.length; colEnds.push(0); }
      colOf[idx] = col;
      colEnds[col] = parsed[idx].endMin;
    }
    const totalCols = colEnds.length;
    for (const idx of members) colCountOf[idx] = totalCols;
  }

  // Expand each event rightward into consecutive free columns
  const spanOf = new Array<number>(n).fill(1);
  for (const members of clusters) {
    const totalCols = colCountOf[members[0]];
    for (const idx of members) {
      let span = 1;
      for (let c = colOf[idx] + 1; c < totalCols; c++) {
        const blocked = members.some(
          (j) => j !== idx && colOf[j] === c &&
            parsed[j].startMin < parsed[idx].endMin &&
            parsed[idx].startMin < parsed[j].endMin,
        );
        if (blocked) break;
        span++;
      }
      spanOf[idx] = span;
    }
  }

  return parsed.map((p, i) => {
    const topPx = (p.startMin / 60) * HOUR_HEIGHT_PX;
    const durationMin = p.endMin - p.startMin;
    const heightPx = Math.max(MIN_EVENT_HEIGHT, (durationMin / 60) * HOUR_HEIGHT_PX);
    return { ev: p.ev, topPx, heightPx, colIndex: colOf[i], colCount: colCountOf[i], colSpan: spanOf[i] };
  });
}

interface WeekDayBlockProps {
  date: Date;
  onDaySelect?: (date: Date) => void;
}

export function WeekDayBlock({ date, onDaySelect }: WeekDayBlockProps) {
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

  const dayEvents: Array<Event | PlannedEvent> = [];
  if (isPast || isToday) {
    Object.values(activeEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
    Object.values(historyEvents).forEach((e) => { if ((e as Event).startDate === dateIso) dayEvents.push(e as Event); });
  } else if (isFuture) {
    Object.values(plannedEvents).forEach((pe) => { if (isPlannedEventDue(pe, dateIso)) dayEvents.push(pe); });
  }

  const gridRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(GRID_HEIGHT);
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    setContainerHeight(el.clientHeight);
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = containerHeight / GRID_HEIGHT;

  const [nowPct, setNowPct] = useState(() => {
    const n = new Date();
    return ((n.getHours() * 60 + n.getMinutes()) / (24 * 60)) * 100;
  });
  useEffect(() => {
    if (!isToday) return;
    const id = setInterval(() => {
      const n = new Date();
      setNowPct(((n.getHours() * 60 + n.getMinutes()) / (24 * 60)) * 100);
    }, 60_000);
    return () => clearInterval(id);
  }, [isToday]);

  const layouts = computeWeekDayLayout(dayEvents);

  function resolveColor(ev: Event | PlannedEvent): string {
    if ('color' in ev && (ev as PlannedEvent).color) return (ev as PlannedEvent).color;
    const evt = ev as Event;
    if (evt.color) return evt.color;
    if (evt.plannedEventRef) return plannedEvents[evt.plannedEventRef]?.color ?? '#9333ea';
    return '#9333ea';
  }

  return (
    <div
      className={`flex flex-1 min-w-[240px] h-full flex-col rounded-lg border bg-white dark:bg-gray-800 transition-colors ${isToday ? 'border-purple-400' : 'border-gray-200 dark:border-gray-700'} ${isPast ? 'opacity-40' : ''} ${onDaySelect ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
      role={onDaySelect ? 'button' : undefined}
      tabIndex={onDaySelect ? 0 : undefined}
      onClick={() => onDaySelect?.(date)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDaySelect?.(date); }}
    >
      {/* Day header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-2 py-1">
        <span className={`text-xs font-semibold ${isToday ? 'text-purple-600' : 'text-gray-700 dark:text-gray-200'}`}>
          {format(date, 'display')}
        </span>
        <span className="w-4" />
      </div>

      {/* Event grid — scales to fill available height, no scroll */}
      <div ref={gridRef} className="relative flex-1 w-full overflow-hidden">
        {/* Hour dividers */}
        {Array.from({ length: 24 }, (_, h) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-700/50"
            style={{ top: `${(h / 24) * 100}%` }}
          />
        ))}

        {/* Event cards */}
        {layouts.map((layout) => {
          const ev = layout.ev;
          const color = resolveColor(ev);
          const widthPercent = (layout.colSpan / layout.colCount) * 100;
          const leftPercent = (layout.colIndex / layout.colCount) * 100;
          const endMin = (ev as { endTime?: string }).endTime
            ? (() => { const [h=0,m=0] = ((ev as {endTime?:string}).endTime ?? '').split(':').map(Number); return h*60+m; })()
            : null;
          const isPastEvent = isToday && endMin !== null && endMin <= (nowPct / 100) * 24 * 60;
          return (
            <WeekEventCard
              key={ev.id}
              name={'name' in ev ? ev.name : '\u2014'}
              color={color}
              topPx={layout.topPx * scale}
              heightPx={Math.max(MIN_EVENT_HEIGHT * scale, layout.heightPx * scale)}
              leftPercent={leftPercent}
              widthPercent={widthPercent}
              muted={isPastEvent}
            />
          );
        })}

        {/* Elapsed time overlay for today */}
        {isToday && (
          <div
            className="absolute left-0 right-0 bg-gray-400/20 dark:bg-gray-900/40 pointer-events-none z-[5]"
            style={{ top: 0, height: `${nowPct}%` }}
          />
        )}

        {/* Current time line */}
        {isToday && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-purple-500 z-10 pointer-events-none"
            style={{ top: `${nowPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
