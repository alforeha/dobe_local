import { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import type { StatGroupKey } from '../../../../../types/user';
import type { TalentGroupStats } from '../../../../../types/stats';
import type { Task } from '../../../../../types/task';
import type { Event, QuickActionsEvent } from '../../../../../types/event';
import type { TaskTemplate } from '../../../../../types/taskTemplate';
import { resolveTemplate } from '../../../../timeViews/DayView/qaUtils';

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

const STAT_LABELS: Record<StatGroupKey, string> = {
  health: 'Health', strength: 'Strength', agility: 'Agility',
  defense: 'Defense', charisma: 'Charisma', wisdom: 'Wisdom',
};

const STAT_ICONS: Record<StatGroupKey, string> = {
  health: '❤️', strength: '⚔️', agility: '⚡',
  defense: '🛡️', charisma: '💬', wisdom: '📖',
};

// Full class strings required for Tailwind content scanning
const CUBE_BG: Record<StatGroupKey, string> = {
  health: 'bg-red-500', strength: 'bg-orange-500', agility: 'bg-green-500',
  defense: 'bg-blue-500', charisma: 'bg-pink-500', wisdom: 'bg-purple-500',
};

const STAT_TEXT: Record<StatGroupKey, string> = {
  health: 'text-red-500', strength: 'text-orange-500', agility: 'text-green-500',
  defense: 'text-blue-500', charisma: 'text-pink-500', wisdom: 'text-purple-500',
};

const DATE_COUNT = 91;
const LABEL_W = 111;  // px — fixed icon column width
const ROW_GAP = 8;   // px — vertical gap between stat rows
const CUBE_GAP = 4;  // px — horizontal gap between cubes
const H_PAD = 8;     // px — left/right padding inside scroll area
const DATE_H = 20;   // px — date header row height
const DATE_GAP = 27;  // px — gap between date row and first cube row
const GRID_PAD_TOP = 27;   // px — breathing room above date row
const GRID_PAD_BOT = 27;  // px — clears scrollbar (~27px) + buffer

// ── DATE HELPERS ─────────────────────────────────────────────────────────────
// Newest on LEFT (index 0 = today), oldest on RIGHT

function buildDates(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < DATE_COUNT; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const DATES = buildDates();

// ── DATA TYPES ────────────────────────────────────────────────────────────────

interface CellData {
  count: number;
  names: string[];
}

type StatCountMap = Record<StatGroupKey, Record<string, CellData>>;

// ── DATA BUILDER ─────────────────────────────────────────────────────────────

function buildStatCounts(
  historyEvents: Record<string, Event | QuickActionsEvent>,
  tasks: Record<string, Task>,
  taskTemplates: Record<string, TaskTemplate>,
): StatCountMap {
  const dateSet = new Set(DATES);
  const result: StatCountMap = {
    health: {}, strength: {}, agility: {}, defense: {}, charisma: {}, wisdom: {},
  };

  const processTask = (task: Task) => {
    if (task.completionState !== 'complete') return;
    const date = task.completedAt?.slice(0, 10);
    if (!date || !dateSet.has(date)) return;
    const template = resolveTemplate(task.templateRef, taskTemplates);
    if (!template) return;
    for (const stat of STAT_ORDER) {
      if ((template.xpAward[stat] ?? 0) > 0) {
        if (!result[stat][date]) result[stat][date] = { count: 0, names: [] };
        result[stat][date].count += 1;
        result[stat][date].names.push(template.name);
      }
    }
  };

  for (const event of Object.values(historyEvents)) {
    if (event.eventType === 'quickActions') {
      const qa = event as QuickActionsEvent;
      for (const comp of qa.completions) {
        const task = tasks[comp.taskRef];
        if (task) processTask(task);
      }
    } else {
      const ev = event as Event;
      for (const taskId of ev.tasks) {
        const task = tasks[taskId];
        if (task) processTask(task);
      }
    }
  }

  return result;
}

// ── PROPS ─────────────────────────────────────────────────────────────────────

export interface StatGroupGridProps {
  talents: Record<StatGroupKey, TalentGroupStats>;
  historyEvents: Record<string, Event | QuickActionsEvent>;
  tasks: Record<string, Task>;
  taskTemplates: Record<string, TaskTemplate>;
}

interface SelectedCube {
  stat: StatGroupKey;
  date: string;
}

// ── POPUP ─────────────────────────────────────────────────────────────────────

interface CubePopupProps {
  selected: SelectedCube;
  statCounts: StatCountMap;
  onClose: () => void;
}

function CubePopup({ selected, statCounts, onClose }: CubePopupProps) {
  const cell = statCounts[selected.stat][selected.date];
  const count = cell?.count ?? 0;
  const names = cell?.names ?? [];
  const parts = selected.date.split('-');
  const label = `${parseInt(parts[1] ?? '1', 10)}/${parseInt(parts[2] ?? '1', 10)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-64 p-4 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`font-semibold text-base ${STAT_TEXT[selected.stat]}`}>
            {STAT_ICONS[selected.stat]} {STAT_LABELS[selected.stat]}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">
          {count} task{count !== 1 ? 's' : ''}
        </p>
        {names.length > 0 ? (
          <ul className="space-y-1 max-h-36 overflow-y-auto">
            {names.map((name, i) => (
              <li key={`${name}-${i}`} className="text-gray-600 dark:text-gray-300 text-xs truncate">
                · {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-xs">No tasks recorded.</p>
        )}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export function StatGroupGrid({ talents, historyEvents, tasks, taskTemplates }: StatGroupGridProps) {
  const [selected, setSelected] = useState<SelectedCube | null>(null);

  // Fixed left column + scrollable right section — ResizeObserver on cube grid
  const scrollRef = useRef<HTMLDivElement>(null);
  const cubeGridRef = useRef<HTMLDivElement>(null);
  const [cubeSize, setCubeSize] = useState(36);

  useLayoutEffect(() => {
    const el = cubeGridRef.current;
    if (!el) return;
    const measure = () =>
      setCubeSize(Math.max(14, Math.floor(
        (el.clientHeight - (STAT_ORDER.length + 1) * ROW_GAP) / STAT_ORDER.length,
      )));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Attach non-passive wheel handler so vertical scroll redirects to horizontal
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY + e.deltaX;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const statCounts = useMemo(
    () => buildStatCounts(historyEvents, tasks, taskTemplates),
    [historyEvents, tasks, taskTemplates],
  );

  const todayIso = new Date().toISOString().slice(0, 10);
  const cubeFs = Math.max(8, Math.floor(cubeSize * 0.40));
  const iconFs = Math.max(14, Math.floor(cubeSize * 0.54));
  const ptFs = Math.max(8, Math.floor(cubeSize * 0.28));
  const scrollWidth = DATE_COUNT * cubeSize + (DATE_COUNT - 1) * CUBE_GAP + H_PAD * 2;

  const handleCubeClick = (stat: StatGroupKey, date: string) => {
    setSelected((prev) =>
      prev?.stat === stat && prev?.date === date ? null : { stat, date },
    );
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Fixed icon column */}
      <div
        className="shrink-0 flex flex-col"
        style={{ width: LABEL_W }}
      >
        {/* Spacer aligned with date header + top padding + date gap */}
        <div className="shrink-0" style={{ height: GRID_PAD_TOP + DATE_H + DATE_GAP }} />
        {/* Icon rows — same flex structure as cube grid */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          style={{ gap: ROW_GAP }}
        >
          {STAT_ORDER.map((stat) => (
            <div
              key={stat}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <span style={{ fontSize: iconFs, lineHeight: 1 }}>
                {STAT_ICONS[stat]}
              </span>
              <span
                className={`font-bold leading-none mt-0.5 ${STAT_TEXT[stat]}`}
                style={{ fontSize: ptFs }}
              >
                {talents[stat]?.statPoints ?? 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable cube area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden"
      >
        <div
          className="h-full flex flex-col"
          style={{
            width: scrollWidth,
            paddingTop: GRID_PAD_TOP,
            paddingBottom: GRID_PAD_BOT,
            paddingLeft: H_PAD,
            paddingRight: H_PAD,
            boxSizing: 'border-box',
          }}
        >
          {/* Date header row */}
          <div
            className="shrink-0 flex"
            style={{ height: DATE_H, gap: CUBE_GAP, marginBottom: DATE_GAP }}
          >
            {DATES.map((date) => {
              const day = parseInt(date.slice(8), 10);
              const isFirst = day === 1;
              const isToday = date === todayIso;
              const monthLabel = isFirst
                ? new Date(date + 'T12:00:00').toLocaleString('default', { month: 'short' })
                : null;
              return (
                <div
                  key={date}
                  className="shrink-0 relative flex items-center justify-center select-none"
                  style={{ width: cubeSize, height: DATE_H }}
                >
                  {isFirst && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: -Math.ceil(CUBE_GAP / 2) - 1,
                        top: 0,
                        bottom: -DATE_GAP,
                        width: 2,
                        background: 'rgba(129,140,248,0.9)',
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <span
                    className={`${
                      isFirst
                        ? 'font-bold text-indigo-400 dark:text-indigo-300'
                        : isToday
                        ? 'font-semibold text-gray-900 dark:text-gray-100'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}
                    style={{ fontSize: cubeFs }}
                  >
                    {monthLabel ?? day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cube grid — 6 rows, fills remaining height */}
          <div
            ref={cubeGridRef}
            className="flex-1 min-h-0 flex flex-col"
            style={{ gap: ROW_GAP }}
          >
            {STAT_ORDER.map((stat) => (
              <div
                key={stat}
                className="flex-1 flex items-center"
                style={{ gap: CUBE_GAP }}
              >
                {DATES.map((date) => {
                  const cell = statCounts[stat][date];
                  const count = cell?.count ?? 0;
                  const isToday = date === todayIso;
                  const day = parseInt(date.slice(8), 10);
                  const isFirst = day === 1;
                  const isSelected = selected?.stat === stat && selected?.date === date;

                  return (
                    <div
                      key={date}
                      className="shrink-0 relative"
                      style={{ width: cubeSize, height: cubeSize }}
                    >
                      {/* Month-start vertical line — sits behind the cube */}
                      {isFirst && (
                        <div
                          className="absolute inset-y-0 pointer-events-none"
                          style={{
                            left: -Math.ceil(CUBE_GAP / 2) - 1,
                            width: 2,
                            background: 'rgba(129,140,248,0.9)',
                            borderRadius: 1,
                          }}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleCubeClick(stat, date)}
                        aria-label={`${STAT_LABELS[stat]} ${date}: ${count} task${count !== 1 ? 's' : ''}`}
                        className={`absolute inset-0 rounded-sm flex items-center justify-center font-semibold leading-none ${
                          count > 0
                            ? `${CUBE_BG[stat]} text-white`
                            : 'bg-gray-300 dark:bg-gray-600'
                        } ${
                          isToday ? 'ring-1 ring-yellow-400' : ''
                        } ${
                          isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-900' : ''
                        }`}
                        style={{ fontSize: cubeFs }}
                      >
                        {count > 0 ? count : ''}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popup — fixed overlay, tap outside to close */}
      {selected !== null && (
        <CubePopup
          selected={selected}
          statCounts={statCounts}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
