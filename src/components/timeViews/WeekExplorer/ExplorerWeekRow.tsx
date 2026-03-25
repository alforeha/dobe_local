import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { useSystemStore } from '../../../stores/useSystemStore';
import { ExplorerDayBlock } from './ExplorerDayBlock';
import { getWeekDays, format, addDays } from '../../../utils/dateUtils';
import { isPlannedEventDue } from '../../../engine/rollover';
import { useAppDate } from '../../../utils/useAppDate';
import type { Event } from '../../../types';

interface ExplorerWeekRowProps {
  weekStart: Date;
  onSelect?: () => void;
}

function parseMinutes(time: string): number {
  if (!time) return 0;
  const [h = 0, m = 0] = time.split(':').map(Number);
  return h * 60 + m;
}

interface ColorBlock {
  id: string; color: string; dayOfWeek: number; durationDays: number;
  startTime: string; endTime: string;
  colIndex: number; colCount: number; colSpan: number;
}

function assignColumns(blocks: Omit<ColorBlock, 'colIndex' | 'colCount' | 'colSpan'>[]): ColorBlock[] {
  if (blocks.length === 0) return [];
  const parsed = blocks.map((b) => {
    const startMin = parseMinutes(b.startTime);
    const rawEnd = parseMinutes(b.endTime);
    const endMin = rawEnd > startMin ? rawEnd : startMin + 60;
    return { ...b, startMin, endMin };
  });
  parsed.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);
  const n = parsed.length;
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
        if (a.startMin < b.endMin && b.startMin < a.endMin) { clusterIdx[k] = clusterId; members.push(k); }
      }
    }
    clusters.push(members);
  }
  const colOf = new Array<number>(n).fill(0);
  const colCountOf = new Array<number>(n).fill(1);
  for (const members of clusters) {
    const sorted = [...members].sort((a, b) => parsed[a].startMin - parsed[b].startMin);
    const colEnds: number[] = [];
    for (const idx of sorted) {
      let col = colEnds.findIndex((et) => et <= parsed[idx].startMin);
      if (col === -1) { col = colEnds.length; colEnds.push(0); }
      colOf[idx] = col;
      colEnds[col] = parsed[idx].endMin;
    }
    const totalCols = colEnds.length;
    for (const idx of members) colCountOf[idx] = totalCols;
  }
  // Expand each event into consecutive free columns to the right
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
  return parsed.map((p, i) => ({ ...p, colIndex: colOf[i], colCount: colCountOf[i], colSpan: spanOf[i] }));
}

/** One week row in the 57-week explorer. Tapping opens that week in WeekView (UI-07). */
export function ExplorerWeekRow({ weekStart, onSelect }: ExplorerWeekRowProps) {
  const days = getWeekDays(weekStart);
  const today = useAppDate();

  const timePreferences = useSystemStore((s) => s.settings?.timePreferences);
  const [rangeStartH, rangeStartM] = (timePreferences?.explorerView?.startTime ?? '00:00').split(':').map(Number);
  const [rangeEndH,   rangeEndM]   = (timePreferences?.explorerView?.endTime   ?? '23:59').split(':').map(Number);
  const rangeStartMin = (rangeStartH ?? 0) * 60 + (rangeStartM ?? 0);
  const rangeEndMin   = (rangeEndH   ?? 23) * 60 + (rangeEndM   ?? 59);
  const rangeMinutes  = Math.max(1, rangeEndMin - rangeStartMin);

  const visibleDays = timePreferences?.explorerView?.visibleDays ?? [0, 1, 2, 3, 4, 5, 6];
  const visibleDaySet = new Set(visibleDays);
  const nVisible = visibleDays.length || 7;

  const { activeEvents, historyEvents, plannedEvents } = useScheduleStore(useShallow((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
  })));

  const rawBlocks: Omit<ColorBlock, 'colIndex' | 'colCount' | 'colSpan'>[] = [];

  days.forEach((day, dayOfWeek) => {
    if (!visibleDaySet.has(dayOfWeek)) return; // skip hidden days
    const visibleIndex = visibleDays.indexOf(dayOfWeek);
    const dateIso = format(day, 'iso');
    const isPastOrToday = day <= today;

    if (isPastOrToday) {
      Object.values(activeEvents).forEach((e) => {
        const ev = e as Event & { startTime?: string; endTime?: string };
        if (ev.startDate === dateIso) {
          const durationDays = Math.max(1, Math.round((new Date(ev.endDate).getTime() - new Date(ev.startDate).getTime()) / 86400000) + 1);
          const color = ev.color ?? (ev.plannedEventRef ? (plannedEvents[ev.plannedEventRef]?.color ?? '#9333ea') : '#9333ea');
          rawBlocks.push({ id: `a-${ev.id}`, color, dayOfWeek: visibleIndex, durationDays, startTime: ev.startTime ?? '00:00', endTime: ev.endTime ?? '01:00' });
        }
      });
      Object.values(historyEvents).forEach((e) => {
        const ev = e as Event & { startTime?: string; endTime?: string };
        if (ev.startDate === dateIso) {
          const durationDays = Math.max(1, Math.round((new Date(ev.endDate).getTime() - new Date(ev.startDate).getTime()) / 86400000) + 1);
          const color = ev.color ?? (ev.plannedEventRef ? (plannedEvents[ev.plannedEventRef]?.color ?? '#9333ea') : '#9333ea');
          rawBlocks.push({ id: `h-${ev.id}`, color, dayOfWeek: visibleIndex, durationDays, startTime: ev.startTime ?? '00:00', endTime: ev.endTime ?? '01:00' });
        }
      });
    } else {
      Object.values(plannedEvents).forEach((pe) => {
        if (isPlannedEventDue(pe, dateIso)) {
          const pex = pe as typeof pe & { startTime?: string; endTime?: string };
          rawBlocks.push({ id: `p-${pe.id}-${visibleIndex}`, color: pe.color, dayOfWeek: visibleIndex, durationDays: 1, startTime: pex.startTime ?? '00:00', endTime: pex.endTime ?? '01:00' });
        }
      });
    }
  });

  // Run overlap/column algorithm per visible day slot
  const blocks: ColorBlock[] = [];
  for (let d = 0; d < nVisible; d++) {
    const dayBlocks = rawBlocks.filter((b) => b.dayOfWeek === d);
    blocks.push(...assignColumns(dayBlocks));
  }

  // Week end boundary for saturday (index 6)
  const weekEndIso = format(addDays(weekStart, 6), 'iso');
  void weekEndIso;

  return (
    <div
      className="relative flex border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-36"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect?.(); }}
    >
      {/* Day label columns — only visible days */}
      {days.filter((_, i) => visibleDaySet.has(i)).map((day) => (
        <ExplorerDayBlock key={format(day, 'iso')} date={day} />
      ))}

      {/* Absolute color stripe blocks — split columns within each day slot */}
      {blocks.map((block) => {
        const daySlotWidth = 1 / nVisible;
        const colWidth = daySlotWidth / block.colCount;
        const leftPercent = (block.dayOfWeek / nVisible + block.colIndex * colWidth) * 100;
        const widthPercent = colWidth * block.colSpan * block.durationDays * 100;
        const [h = 0, m = 0] = block.startTime.split(':').map(Number);
        const blockStartMin = h * 60 + m;
        const clampedMin = Math.max(rangeStartMin, Math.min(rangeEndMin, blockStartMin));
        const topPercent = ((clampedMin - rangeStartMin) / rangeMinutes) * 100;
        return (
          <div
            key={block.id}
            className="absolute h-2 rounded-sm pointer-events-none"
            style={{
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              top: `${topPercent}%`,
              backgroundColor: block.color,
            }}
          />
        );
      })}
    </div>
  );
}

