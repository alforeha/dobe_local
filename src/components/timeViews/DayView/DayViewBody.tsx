import { useState, useEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { EventBlock } from './EventBlock';
import { QACompletionIcon } from './QACompletionIcon';
import { QACompletionPopup } from './QACompletionPopup';
import { resolveTaskIcon, resolveTemplate, findQAEventForDate } from './qaUtils';
import { format, hourLabel, isSameDay, addDays } from '../../../utils/dateUtils';
import { isOneOffEvent } from '../../../utils/isOneOffEvent';
import { isPlannedEventDue } from '../../../engine/rollover';
import type { Event, PlannedEvent, QuickActionsCompletion } from '../../../types';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

/** Must match EventBlock ROW_HEIGHT_PX (3.5rem × 16px = 56px) */
const ROW_HEIGHT_PX = 56;

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

function extractHour(iso: string): number {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? 0 : d.getHours();
}

function parseMinutesOfDay(time: string): number {
  if (!time) return 0;
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

// ── HOUR ROW LAYOUT ENGINE ─────────────────────────────────────────────────────
// Part 1 (UV-C): sequential back-to-back events stack vertically; row height expands.
// Part 2 (UV-C): overlapping concurrent events lay out side by side in columns.

interface HourLayout {
  ev: Event | PlannedEvent;
  topPx: number;
  colIndex: number;
  colCount: number;
}

interface HourLayoutResult {
  layouts: HourLayout[];
  rowHeight: number;
}

/**
 * Compute per-event layout for a single hour row.
 *
 * - Events whose time ranges overlap → same topPx, each assigned a column (side-by-side).
 * - Events that are sequential → stacked vertically (different topPx).
 *
 * `getDisplayEnd` returns the end-time string to use for sizing
 * (allows '23:59' override for continues-tomorrow events).
 */
function computeHourLayout(
  events: (Event | PlannedEvent)[],
  getDisplayEnd: (ev: Event | PlannedEvent) => string,
): HourLayoutResult {
  if (events.length === 0) return { layouts: [], rowHeight: ROW_HEIGHT_PX };

  const parsed = events.map((ev) => {
    const startMin = parseMinutesOfDay(
      (ev as { startTime?: string }).startTime ?? '00:00',
    );
    const rawEnd = parseMinutesOfDay(getDisplayEnd(ev));
    // Ensure endMin > startMin so duration is positive
    const endMin = rawEnd > startMin ? rawEnd : startMin + 15;
    return { ev, startMin, endMin };
  });

  // Sort by start time; longer events first on tie
  parsed.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const n = parsed.length;

  // ── Build overlap clusters (connected components) ─────────────────────────
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
        // Events A and B overlap iff A.start < B.end && B.start < A.end
        if (a.startMin < b.endMin && b.startMin < a.endMin) {
          clusterIdx[k] = clusterId;
          members.push(k);
        }
      }
    }
    clusters.push(members);
  }

  // ── Greedy column assignment within each cluster ───────────────────────────
  const colOf = new Array<number>(n).fill(0);
  const colCountOf = new Array<number>(n).fill(1);

  for (const members of clusters) {
    const sorted = [...members].sort(
      (a, b) => parsed[a].startMin - parsed[b].startMin,
    );
    const colEnds: number[] = []; // colEnds[col] = end time of last event in that column
    for (const idx of sorted) {
      const s = parsed[idx].startMin;
      let col = colEnds.findIndex((et) => et <= s);
      if (col === -1) {
        col = colEnds.length;
        colEnds.push(0);
      }
      colOf[idx] = col;
      colEnds[col] = parsed[idx].endMin;
    }
    const totalCols = colEnds.length;
    for (const idx of members) colCountOf[idx] = totalCols;
  }

  // ── Order clusters chronologically; assign vertical (top) positions ────────
  const orderedClusters = clusters
    .map((members) => ({
      members,
      minStart: Math.min(...members.map((m) => parsed[m].startMin)),
    }))
    .sort((a, b) => a.minStart - b.minStart);

  const topPxOf = new Array<number>(n).fill(0);
  let currentTopPx = 0;

  for (const cluster of orderedClusters) {
    const clusterHeight = Math.max(
      ...cluster.members.map((m) => {
        const dur = Math.max(0, parsed[m].endMin - parsed[m].startMin);
        return Math.max(32, (dur / 60) * ROW_HEIGHT_PX);
      }),
    );
    for (const m of cluster.members) topPxOf[m] = currentTopPx;
    currentTopPx += clusterHeight;
  }

  const layouts: HourLayout[] = parsed.map((p, i) => ({
    ev: p.ev,
    topPx: topPxOf[i],
    colIndex: colOf[i],
    colCount: colCountOf[i],
  }));

  return { layouts, rowHeight: Math.max(ROW_HEIGHT_PX, currentTopPx) };
}

// ── MULTI-DAY BANNERS (Part 3 — UV-C) ─────────────────────────────────────────
// Events spanning multiple days are shown in a banner strip above the hour grid.
// Three cases:
//   'spanning'  — started before today, ends after today (all-day banner)
//   'continued' — started before today, ends today (show endTime)
//   'overnight' — future PlannedEvent that was due yesterday and crosses midnight

interface MultiDayItem {
  id: string;
  name: string;
  color: string;
  kind: 'spanning' | 'continued' | 'overnight';
  label: string;
}

function MultiDayBanner({ items }: { items: MultiDayItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="shrink-0 px-3 py-1.5 flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 px-2 py-1 rounded text-xs text-white font-medium"
          style={{ backgroundColor: item.color }}
        >
          <span className="truncate flex-1">{item.name}</span>
          <span className="text-white/80 whitespace-nowrap shrink-0">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── PROPS ─────────────────────────────────────────────────────────────────────

interface DayViewBodyProps {
  date: Date;
  onEventOpen: (eventId: string) => void;
  /** Optional — opens OneOffEventPopup for future one-off planned events */
  onEditPlanned?: (plannedId: string) => void;
}

export function DayViewBody({ date, onEventOpen, onEditPlanned }: DayViewBodyProps) {
  const [openCompletion, setOpenCompletion] = useState<QuickActionsCompletion | null>(null);

  // Tick every minute so the time indicator stays accurate
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { activeEvents, historyEvents, plannedEvents, tasks, taskTemplates } = useScheduleStore(
    useShallow((s) => ({
      activeEvents: s.activeEvents,
      historyEvents: s.historyEvents,
      plannedEvents: s.plannedEvents,
      tasks: s.tasks,
      taskTemplates: s.taskTemplates,
    })),
  );

  const dateIso = format(date, 'iso');
  const yesterdayIso = format(addDays(date, -1), 'iso');
  const today = useAppDate();
  const isPast = date < today;
  const isToday = isSameDay(date, today);
  const isFuture = date > today;

  // QA completions for this date — read-only display only
  // Uses robust finder that handles UTC vs local date key mismatch
  const qaEvent = findQAEventForDate(activeEvents, historyEvents, dateIso);
  const qaCompletions: QuickActionsCompletion[] = qaEvent?.completions ?? [];

  // Group QA completions by hour slot for rendering
  const qaByHour = new Map<number, QuickActionsCompletion[]>();
  for (const c of qaCompletions) {
    const h = extractHour(c.completedAt);
    if (!qaByHour.has(h)) qaByHour.set(h, []);
    qaByHour.get(h)!.push(c);
  }

  // ── Collect events ────────────────────────────────────────────────────────
  // dayEvents: events that START on this date — shown in the hour grid.
  // multiDayItems: spanning / continued / overnight events — shown in top banner.
  // continuesOverride: maps eventId → '23:59' for events continuing to next day.
  // labelOverride: maps eventId → label string shown inside the EventBlock.

  const dayEvents: (Event | PlannedEvent)[] = [];
  const multiDayItems: MultiDayItem[] = [];
  const continuesOverride = new Map<string, string>();
  const labelOverride = new Map<string, string>();

  function resolveEventColor(ev: Event): string {
    if (ev.color) return ev.color;
    if (ev.plannedEventRef) return plannedEvents[ev.plannedEventRef]?.color ?? '#9333ea';
    return '#9333ea';
  }

  if (isPast || isToday) {
    const allEntries = [
      ...Object.values(activeEvents),
      ...Object.values(historyEvents),
    ];
    for (const e of allEntries) {
      const ev = e as Event;
      if (ev.eventType === 'quickActions') continue;
      const startsToday = ev.startDate === dateIso;
      const endsToday = ev.endDate === dateIso;
      const isMultiDay = ev.startDate !== ev.endDate;

      if (!isMultiDay) {
        if (startsToday) dayEvents.push(ev);
      } else if (startsToday) {
        // Continues tomorrow: starts today, ends on a future date
        dayEvents.push(ev);
        continuesOverride.set(ev.id, '23:59');
        labelOverride.set(ev.id, '↓ continues');
      } else if (endsToday) {
        // Continued: started before today, ends today — show in banner
        multiDayItems.push({
          id: ev.id,
          name: ev.name,
          color: resolveEventColor(ev),
          kind: 'continued',
          label: `↑ started ${ev.startDate} → ${ev.endTime}`,
        });
      } else if (ev.startDate < dateIso && ev.endDate > dateIso) {
        // Spanning: all of today — full-day banner
        multiDayItems.push({
          id: ev.id,
          name: ev.name,
          color: resolveEventColor(ev),
          kind: 'spanning',
          label: '⬛ all day',
        });
      }
    }
  } else if (isFuture) {
    // Future: project recurring PEs onto matching days
    Object.values(plannedEvents).forEach((pe) => {
      const dueToday = isPlannedEventDue(pe, dateIso);
      const dueYesterday = isPlannedEventDue(pe, yesterdayIso);
      const isOvernight =
        parseMinutesOfDay(pe.endTime) < parseMinutesOfDay(pe.startTime);

      if (dueToday) {
        if (isOvernight) {
          // Overnight PE: show from startTime to 23:59 with label
          dayEvents.push(pe);
          continuesOverride.set(pe.id, '23:59');
          labelOverride.set(pe.id, '↓ continues');
        } else {
          dayEvents.push(pe);
        }
      }
      // PE was due yesterday and crosses midnight — end portion shows today
      if (dueYesterday && isOvernight) {
        multiDayItems.push({
          id: `${pe.id}--overnight`,
          name: pe.name,
          color: pe.color,
          kind: 'overnight',
          label: `↑ started yesterday → ${pe.endTime}`,
        });
      }
    });
  }

  // ── Display end-time resolver (passed to layout engine) ──────────────────
  function getDisplayEnd(ev: Event | PlannedEvent): string {
    return (
      continuesOverride.get(ev.id) ??
      (ev as { endTime?: string }).endTime ??
      '01:00'
    );
  }

  const now = new Date();
  const nowHour = isToday ? now.getHours() : -1;
  const nowMinutes = isToday ? now.getMinutes() : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Multi-day banner — spanning / continued / overnight events */}
      <MultiDayBanner items={multiDayItems} />

      {HOURS.map((h) => {
        const hourEvents = dayEvents.filter((e) => {
          const st = 'startTime' in e ? e.startTime : null;
          return st ? parseHour(st) === h : false;
        });

        const { layouts, rowHeight } = computeHourLayout(hourEvents, getDisplayEnd);

        return (
          <div
            key={h}
            className="relative flex w-full border-b border-gray-100 dark:border-gray-700"
            style={{ minHeight: `${rowHeight}px` }}
          >
            {/* Hour label */}
            <div className="w-12 shrink-0 py-1 pr-2 text-right text-xs text-gray-400 dark:text-gray-500">
              {hourLabel(h)}
            </div>

            {/* Content column */}
            <div className="relative flex-1 py-0.5">
              {/* Current time indicator — positioned to the exact minute */}
              {h === nowHour && (
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-purple-500"
                  style={{ top: `${(nowMinutes / 60) * 100}%` }}
                />
              )}

              {/* Event blocks — laid out by computeHourLayout */}
              {layouts.map((layout) => {
                const ev = layout.ev;
                const isRealEvent = 'startDate' in ev;
                const isPlanned = !isRealEvent;
                const eventId = ev.id;
                const plannedEv = isPlanned ? (ev as PlannedEvent) : null;
                const isFutureOneOff =
                  isFuture && plannedEv !== null && isOneOffEvent(plannedEv) && !!onEditPlanned;
                const isInteractive = (!isPlanned && (isPast || isToday)) || isFutureOneOff;
                const handleOpen = isInteractive
                  ? isFutureOneOff
                    ? () => onEditPlanned!(eventId)
                    : () => onEventOpen(eventId)
                  : undefined;
                const resolvedColor = isPlanned
                  ? (ev as PlannedEvent).color
                  : (ev as Event).color
                    ? (ev as Event).color!
                    : (ev as Event).plannedEventRef
                      ? (plannedEvents[(ev as Event).plannedEventRef!]?.color ?? '#9333ea')
                      : '#9333ea';
                const taskTotal = isPlanned
                  ? (ev as PlannedEvent).taskList.length
                  : (ev as Event).tasks.length;
                const taskDone = isPlanned
                  ? 0
                  : (ev as Event).tasks.filter(
                      (id) => tasks[id]?.completionState === 'complete',
                    ).length;
                const evCompletionState = isPlanned ? undefined : (ev as Event).completionState;
                const mdLabel = labelOverride.get(ev.id);
                const displayEnd =
                  continuesOverride.get(ev.id) ??
                  (ev as { endTime?: string }).endTime ??
                  '';

                return (
                  <EventBlock
                    key={eventId}
                    eventId={eventId}
                    name={'name' in ev ? ev.name : '—'}
                    color={resolvedColor}
                    startTime={'startTime' in ev ? ev.startTime : ''}
                    endTime={displayEnd}
                    taskCount={taskTotal}
                    taskComplete={taskDone}
                    completionState={evCompletionState}
                    topOffset={layout.topPx}
                    colIndex={layout.colIndex}
                    colCount={layout.colCount}
                    multiDayLabel={mdLabel}
                    interactive={isInteractive}
                    onOpen={handleOpen}
                  />
                );
              })}

              {/* QA completion badges — small circular icons at completion time */}
              {(qaByHour.get(h) ?? []).map((c, idx) => {
                const task = tasks[c.taskRef];
                const tmpl = task ? resolveTemplate(task.templateRef, taskTemplates) : null;
                const icon = resolveTaskIcon(tmpl);
                return (
                  <QACompletionIcon
                    key={`${c.taskRef}-${c.completedAt}`}
                    icon={icon}
                    offsetIndex={idx}
                    onClick={() => setOpenCompletion(c)}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* QA completion detail popup */}
      {openCompletion && (
        <QACompletionPopup
          completion={openCompletion}
          onClose={() => setOpenCompletion(null)}
        />
      )}
    </div>
  );
}
