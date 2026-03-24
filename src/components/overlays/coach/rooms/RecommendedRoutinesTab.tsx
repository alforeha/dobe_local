// ─────────────────────────────────────────
// RecommendedRoutinesTab — Routines sub-view for RecommendationsRoom
// Shows all prebuilt routines from RoutineLibrary.
// Filter by tag, search by name.
// "Add to Schedule" opens RoutinePopup pre-filled.
// ─────────────────────────────────────────

import { useState, useMemo } from 'react';
import { routineLibrary } from '../../../../coach/RoutineLibrary';
import type { PrebuiltRoutine, RoutineTag } from '../../../../coach/RoutineLibrary';
import { RoutinePopup } from '../../menu/rooms/ScheduleRoom/RoutinePopup';
import type { RoutinePopupPrefill } from '../../menu/rooms/ScheduleRoom/RoutinePopup';

// ── TAG CONFIG ────────────────────────────────────────────────────────────────

const ALL_TAGS: RoutineTag[] = [
  'health', 'morning', 'mindfulness', 'evening',
  'work', 'productivity', 'fitness', 'strength',
  'nutrition', 'home', 'admin', 'finance',
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RecommendedRoutinesTab() {
  const [filterTag, setFilterTag] = useState<RoutineTag | 'All'>('All');
  const [search, setSearch] = useState('');
  const [prefill, setPrefill] = useState<RoutinePopupPrefill | null>(null);

  const visible = useMemo(() => {
    let list = routineLibrary;
    if (filterTag !== 'All') {
      list = list.filter((r) => r.tags.includes(filterTag));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [filterTag, search]);

  function handleAddToSchedule(routine: PrebuiltRoutine) {
    setPrefill({
      name: routine.name,
      icon: routine.icon,
      color: routine.color,
      taskPool: routine.taskPool,
      recurrenceInterval: routine.recurrenceInterval,
    });
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Controls ── */}
        <div className="shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search routines…"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 pr-8 text-sm text-gray-800 dark:text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-base leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* Tag filter pills */}
          <div className="flex flex-wrap gap-1">
            <TagPill
              label="All"
              active={filterTag === 'All'}
              onClick={() => setFilterTag('All')}
            />
            {ALL_TAGS.map((tag) => (
              <TagPill
                key={tag}
                label={tag}
                active={filterTag === tag}
                onClick={() => setFilterTag(tag)}
              />
            ))}
          </div>
        </div>

        {/* ── Routine list ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
          {visible.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No routines match your filter.
            </p>
          )}
          {visible.map((routine) => (
            <RoutineRow
              key={routine.id}
              routine={routine}
              onAdd={() => handleAddToSchedule(routine)}
            />
          ))}
        </div>
      </div>

      {/* ── RoutinePopup portal (pre-filled from prebuilt) ── */}
      {prefill !== null && (
        <RoutinePopup
          editRoutine={null}
          prefill={prefill}
          onClose={() => setPrefill(null)}
        />
      )}
    </>
  );
}

// ── TAG PILL ──────────────────────────────────────────────────────────────────

interface TagPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TagPill({ label, active, onClick }: TagPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

// ── ROUTINE ROW ───────────────────────────────────────────────────────────────

interface RoutineRowProps {
  routine: PrebuiltRoutine;
  onAdd: () => void;
}

function RoutineRow({ routine, onAdd }: RoutineRowProps) {
  const shownTags = routine.tags.slice(0, 2);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Icon / color swatch */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: routine.color + '33' }}
        aria-hidden="true"
      >
        {routine.icon}
      </div>

      {/* Name + description + tags */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {routine.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate leading-snug">
          {routine.description}
        </p>
        {shownTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {shownTags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium capitalize bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add to Schedule */}
      <button
        type="button"
        onClick={onAdd}
        className="shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors"
        aria-label={`Add ${routine.name} to schedule`}
      >
        + Add
      </button>
    </div>
  );
}
