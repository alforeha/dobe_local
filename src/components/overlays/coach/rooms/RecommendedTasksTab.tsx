// ─────────────────────────────────────────
// RecommendedTasksTab — Tasks sub-view for RecommendationsRoom
// Shows all prebuilt TaskTemplates (library JSON + starter templates).
// Filter by TaskType and search by name.
// Activating copies a template to scheduleStore.taskTemplates (D88).
// Quest-locked templates cannot be deactivated (D89).
// ─────────────────────────────────────────

import { useState, useMemo } from 'react';
import { taskTemplateLibrary } from '../../../../coach';
import { starterTaskTemplates } from '../../../../coach/StarterQuestLibrary';
import { useScheduleStore } from '../../../../stores/useScheduleStore';
import { useProgressionStore } from '../../../../stores/useProgressionStore';
import type { TaskTemplate, TaskType, XpAward } from '../../../../types/taskTemplate';
import type { StatGroupKey } from '../../../../types/user';

// ── STAT ICONS (mirrors StatIcon.tsx) ────────────────────────────────────────

const STAT_ICONS: Record<StatGroupKey, string> = {
  health: '❤️',
  strength: '⚔️',
  agility: '⚡',
  defense: '🛡️',
  charisma: '💬',
  wisdom: '📖',
};

const STAT_KEYS: StatGroupKey[] = [
  'health', 'strength', 'agility', 'defense', 'charisma', 'wisdom',
];

function getPrimaryStatIcon(xpAward: XpAward): string {
  let best: StatGroupKey | null = null;
  let bestVal = 0;
  for (const key of STAT_KEYS) {
    const val = xpAward[key];
    if (val > bestVal) {
      bestVal = val;
      best = key;
    }
  }
  if (best === null || bestVal === 0) return '⚡'; // neutral for zero-XP (e.g. ROLL)
  return STAT_ICONS[best];
}

// ── TASK TYPE PILLS ───────────────────────────────────────────────────────────

const ALL_TASK_TYPES: TaskType[] = [
  'CHECK', 'COUNTER', 'SETS_REPS', 'CIRCUIT', 'DURATION',
  'TIMER', 'RATING', 'TEXT', 'FORM', 'CHOICE', 'CHECKLIST',
  'SCAN', 'LOG', 'LOCATION_POINT', 'LOCATION_TRAIL', 'ROLL',
];

const TYPE_LABELS: Record<TaskType, string> = {
  CHECK: 'CHECK',
  COUNTER: 'COUNT',
  SETS_REPS: 'SETS',
  CIRCUIT: 'CIRC',
  DURATION: 'DUR',
  TIMER: 'TIMER',
  RATING: 'RATE',
  TEXT: 'TEXT',
  FORM: 'FORM',
  CHOICE: 'CHOICE',
  CHECKLIST: 'LIST',
  SCAN: 'SCAN',
  LOG: 'LOG',
  LOCATION_POINT: 'LOC',
  LOCATION_TRAIL: 'TRAIL',
  ROLL: 'ROLL',
};

// ── MERGED TEMPLATE LIST ──────────────────────────────────────────────────────

function getMergedTemplates(): TaskTemplate[] {
  const map = new Map<string, TaskTemplate>();
  for (const t of taskTemplateLibrary) {
    if (t.id) map.set(t.id, t);
  }
  for (const t of starterTaskTemplates) {
    if (t.id && !map.has(t.id)) map.set(t.id, t);
  }
  return Array.from(map.values());
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RecommendedTasksTab() {
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);
  const setTaskTemplate = useScheduleStore((s) => s.setTaskTemplate);
  const removeTaskTemplate = useScheduleStore((s) => s.removeTaskTemplate);
  // Quest-locked: any active Marker referencing this template id (D89)
  // Path: acts → chains[] → quests[] → timely.markers[] (activeState) → taskTemplateRef
  const acts = useProgressionStore((s) => s.acts);
  const lockedTemplateIds = useMemo(() => {
    const ids = new Set<string>();
    for (const act of Object.values(acts)) {
      for (const chain of act.chains) {
        for (const quest of chain.quests) {
          for (const marker of quest.timely.markers) {
            if (marker.activeState && marker.taskTemplateRef) ids.add(marker.taskTemplateRef);
          }
        }
      }
    }
    return ids;
  }, [acts]);

  const [filterType, setFilterType] = useState<TaskType | 'All'>('All');
  const [search, setSearch] = useState('');

  const allTemplates = useMemo(() => getMergedTemplates(), []);

  const visible = useMemo(() => {
    let list = allTemplates;
    if (filterType !== 'All') {
      list = list.filter((t) => t.taskType === filterType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [allTemplates, filterType, search]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Controls ── */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
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

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-1">
          <TypePill
            label="All"
            active={filterType === 'All'}
            onClick={() => setFilterType('All')}
          />
          {ALL_TASK_TYPES.map((type) => (
            <TypePill
              key={type}
              label={TYPE_LABELS[type]}
              active={filterType === type}
              onClick={() => setFilterType(type)}
            />
          ))}
        </div>
      </div>

      {/* ── Template list ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No templates match your filter.
          </p>
        )}
        {visible.map((template) => {
          const id = template.id ?? '';
          // Active: template has been copied into scheduleStore.taskTemplates (D88)
          const active = id !== '' && id in taskTemplates;
          const locked = active && lockedTemplateIds.has(id);
          return (
            <TaskTemplateRow
              key={template.id ?? template.name}
              template={template}
              active={active}
              locked={locked}
              onToggle={() => {
                if (!template.id) return;
                if (active) {
                  removeTaskTemplate(template.id);
                } else {
                  setTaskTemplate(template.id, template);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── TYPE PILL ─────────────────────────────────────────────────────────────────

interface TypePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TypePill({ label, active, onClick }: TypePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

// ── TASK TEMPLATE ROW ─────────────────────────────────────────────────────────

interface TaskTemplateRowProps {
  template: TaskTemplate;
  active: boolean;
  locked: boolean;
  onToggle: () => void;
}

function TaskTemplateRow({ template, active, locked, onToggle }: TaskTemplateRowProps) {
  const statIcon = getPrimaryStatIcon(template.xpAward);
  const typeLabel = TYPE_LABELS[template.taskType as TaskType] ?? template.taskType;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {/* Stat icon */}
      <span className="text-base leading-none shrink-0" aria-hidden="true">
        {statIcon}
      </span>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {template.name}
        </p>
        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          {typeLabel}
        </span>
      </div>

      {/* Toggle / Lock */}
      {locked ? (
        <div
          className="shrink-0 flex flex-col items-center gap-0.5"
          title="Required by active quest"
        >
          <span className="text-base leading-none" aria-hidden="true">🔒</span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">Quest</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            active
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label={active ? `Remove ${template.name} from library` : `Add ${template.name} to library`}
        >
          {active ? 'Active' : 'Add'}
        </button>
      )}
    </div>
  );
}
