import { useState, useEffect } from 'react';
import { useAppDate } from '../../../utils/useAppDate';
import { useScheduleStore } from '../../../stores/useScheduleStore';
import { useShallow } from 'zustand/react/shallow';
import { EventBlock } from './EventBlock';
import { QACompletionIcon } from './QACompletionIcon';
import { QACompletionPopup } from './QACompletionPopup';
import { resolveTaskIcon, resolveTemplate, findQAEventForDate } from './qaUtils';
import { format, hourLabel, isSameDay } from '../../../utils/dateUtils';
import { isOneOffEvent } from '../../../utils/isOneOffEvent';
import { isPlannedEventDue } from '../../../engine/rollover';
import type { Event, PlannedEvent, QuickActionsCompletion } from '../../../types';

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

/** Extract local hour (0–23) from a full ISO datetime string */
function extractHour(iso: string): number {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? 0 : d.getHours();
}


export function DayViewBody({ date, onEventOpen, onEditPlanned }: DayViewBodyProps) {
  const [openCompletion, setOpenCompletion] = useState<QuickActionsCompletion | null>(null);

  // Tick every minute so the time indicator stays accurate (Part 2)
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const { activeEvents, historyEvents, plannedEvents, tasks, taskTemplates } = useScheduleStore(useShallow((s) => ({
    activeEvents: s.activeEvents,
    historyEvents: s.historyEvents,
    plannedEvents: s.plannedEvents,
    tasks: s.tasks,
    taskTemplates: s.taskTemplates,
  })));

  const dateIso = format(date, 'iso');
  const today = useAppDate();
  const isPast = date < today;
  const isToday = isSameDay(date, today);
  const isFuture = date > today;

  // QA completions for this date — read-only display only
  // Uses robust finder that handles UTC vs local date key mismatch (LuckyDice stores UTC key)
  const qaEvent = findQAEventForDate(activeEvents, historyEvents, dateIso);
  const qaCompletions: QuickActionsCompletion[] = qaEvent?.completions ?? [];

  // Group QA completions by hour slot for rendering
  const qaByHour = new Map<number, QuickActionsCompletion[]>();
  for (const c of qaCompletions) {
    const h = extractHour(c.completedAt);
    if (!qaByHour.has(h)) qaByHour.set(h, []);
    qaByHour.get(h)!.push(c);
  }

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
    // Future: project recurring PEs onto every matching day via recurrence rule
    Object.values(plannedEvents).forEach((pe) => {
      if (isPlannedEventDue(pe, dateIso)) dayEvents.push(pe);
    });
  }

  const now = new Date();
  const nowHour = isToday ? now.getHours() : -1;
  const nowMinutes = isToday ? now.getMinutes() : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {HOURS.map((h) => {
        // Find events starting in this hour
        const hourEvents = dayEvents.filter((e) => {
          const st = 'startTime' in e ? e.startTime : null;
          return st ? parseHour(st) === h : false;
        });

        return (
          <div key={h} className="relative flex w-full min-h-14 border-b border-gray-100 dark:border-gray-700">
            {/* Hour label */}
            <div className="w-12 shrink-0 py-1 pr-2 text-right text-xs text-gray-400 dark:text-gray-500">
              {hourLabel(h)}
            </div>

            {/* Content column */}
            <div className="relative flex-1 py-0.5">
              {/* Current time indicator — positioned to the exact minute (Part 2) */}
              {h === nowHour && (
                <div
                  className="absolute left-0 right-0 z-10 border-t-2 border-purple-500"
                  style={{ top: `${(nowMinutes / 60) * 100}%` }}
                />
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
                // Resolve color: direct Event.color → PlannedEvent lookup → fallback
                const resolvedColor = isPlanned
                  ? (ev as PlannedEvent).color
                  : (ev as Event).color
                    ? (ev as Event).color!
                    : (ev as Event).plannedEventRef
                      ? (plannedEvents[(ev as Event).plannedEventRef!]?.color ?? '#9333ea')
                      : '#9333ea';
                // Task progress: real events resolve completions from store (Part 4)
                const taskTotal = isPlanned
                  ? (ev as PlannedEvent).taskList.length
                  : (ev as Event).tasks.length;
                const taskDone = isPlanned
                  ? 0
                  : (ev as Event).tasks.filter(
                      (id) => tasks[id]?.completionState === 'complete',
                    ).length;
                const evCompletionState = isPlanned ? undefined : (ev as Event).completionState;
                return (
                  <EventBlock
                    key={eventId}
                    eventId={eventId}
                    name={'name' in ev ? ev.name : '—'}
                    color={resolvedColor}
                    startTime={'startTime' in ev ? ev.startTime : ''}
                    endTime={'endTime' in ev ? ev.endTime : ''}
                    taskCount={taskTotal}
                    taskComplete={taskDone}
                    completionState={evCompletionState}
                    offsetIndex={idx}
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
