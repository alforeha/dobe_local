// ─────────────────────────────────────────
// RecommendedTasksTab — Tasks sub-view for RecommendationsRoom
// Shows all prebuilt TaskTemplates (library JSON + starter templates).
// Filter by TaskType and search by name.
// Activating copies a template to scheduleStore.taskTemplates (D88).
// Quest-locked templates cannot be deactivated (D89).
// ─────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from 'react';
import { taskTemplateLibrary } from '../../../../coach';
import { starterTaskTemplates } from '../../../../coach/StarterQuestLibrary';
import { useScheduleStore } from '../../../../stores/useScheduleStore';
import { useProgressionStore } from '../../../../stores/useProgressionStore';
import { resolveIcon } from '../../../../constants/iconMap';
import type { TaskTemplate, TaskType, XpAward } from '../../../../types/taskTemplate';
import type { StatGroupKey } from '../../../../types/user';

// ── STAT ICONS (mirrors StatIcon.tsx) ────────────────────────────────────────

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
  if (best === null || bestVal === 0) return resolveIcon('agility'); // ⚡ for zero-XP (e.g. ROLL)
  return resolveIcon(best);
}

function getPrimaryStatKey(xpAward: XpAward): StatGroupKey | null {
  let best: StatGroupKey | null = null;
  let bestVal = 0;
  for (const key of STAT_KEYS) {
    const val = xpAward[key];
    if (val > bestVal) {
      bestVal = val;
      best = key;
    }
  }
  return best;
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
    if (t.id && !map.has(t.id) && t.isSystem !== true) map.set(t.id, t);
  }
  return Array.from(map.values()).filter((t) => t.isSystem !== true);
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RecommendedTasksTab() {
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);
  const plannedEvents = useScheduleStore((s) => s.plannedEvents);
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
  const usedTemplateIds = useMemo(() => {
    const ids = new Set<string>();
    for (const event of Object.values(plannedEvents)) {
      for (const taskId of event.taskPool) {
        ids.add(taskId);
      }
    }
    return ids;
  }, [plannedEvents]);

  const [selectedTypes, setSelectedTypes] = useState<TaskType[]>([]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [filterStat, setFilterStat] = useState<StatGroupKey | 'All'>('All');
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');

  const typeDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    }
    if (typeDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [typeDropdownOpen]);

  const allTemplates = useMemo(() => getMergedTemplates(), []);

  const visible = useMemo(() => {
    let list = allTemplates;
    if (!showInactive) {
      list = list.filter((t) => t.id !== undefined && t.id !== '' && t.id in taskTemplates);
    }
    if (selectedTypes.length > 0) {
      list = list.filter((t) => selectedTypes.includes(t.taskType as TaskType));
    }
    if (filterStat !== 'All') {
      list = list.filter((t) => getPrimaryStatKey(t.xpAward) === filterStat);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    return list;
  }, [allTemplates, showInactive, taskTemplates, selectedTypes, filterStat, search]);

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

        {/* Type filter dropdown + Show inactive toggle */}
        <div className="flex items-center gap-2" ref={typeDropdownRef}>
          <TypeDropdown
            open={typeDropdownOpen}
            selectedTypes={selectedTypes}
            onToggle={() => setTypeDropdownOpen((v) => !v)}
            onChange={setSelectedTypes}
            onClose={() => setTypeDropdownOpen(false)}
          />
          <label className="ml-auto flex items-center gap-1.5 cursor-pointer text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
            />
            Show inactive
          </label>
        </div>

        {/* Stat group pills */}
        <div className="flex flex-wrap gap-1">
          <TypePill label="All" active={filterStat === 'All'} onClick={() => setFilterStat('All')} />
          {STAT_KEYS.map((key) => (
            <TypePill
              key={key}
              label={resolveIcon(key)}
              active={filterStat === key}
              onClick={() => setFilterStat(key)}
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
          const used = active && id !== '' && usedTemplateIds.has(id);
          return (
            <TaskTemplateRow
              key={template.id ?? template.name}
              template={template}
              active={active}
              used={used}
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
  used: boolean;
  locked: boolean;
  onToggle: () => void;
}

function TaskTemplateRow({ template, active, used, locked, onToggle }: TaskTemplateRowProps) {
  const statIcon = getPrimaryStatIcon(template.xpAward);
  const typeLabel = TYPE_LABELS[template.taskType as TaskType] ?? template.taskType;
  const blocked = locked || used;

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
      {blocked ? (
        <div
          className="shrink-0 flex flex-col items-center gap-0.5"
          title={locked ? 'Required by active quest' : 'Used by planned event'}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {resolveIcon(locked ? 'lock' : 'event')}
          </span>
          <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">
            {locked ? 'Quest' : 'Used'}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
            used
              ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60'
              : active
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          aria-label={active ? `Remove ${template.name} from library` : `Add ${template.name} to library`}
        >
          {used ? 'Used' : active ? 'Active' : 'Inactive'}
        </button>
      )}
    </div>
  );
}

// ── TYPE DROPDOWN (multiselect) ───────────────────────────────────────────────

interface TypeDropdownProps {
  open: boolean;
  selectedTypes: TaskType[];
  onToggle: () => void;
  onChange: (types: TaskType[]) => void;
  onClose: () => void;
}

function TypeDropdown({ open, selectedTypes, onToggle, onChange, onClose }: TypeDropdownProps) {
  const count = selectedTypes.length;
  const label = count === 0 ? 'Filter by type' : `${count} type${count !== 1 ? 's' : ''} selected`;

  function toggleType(type: TaskType) {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  }

  return (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
          count > 0
            ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-[10px] text-gray-400" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-full min-w-[160px] rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-h-48 overflow-y-auto py-1">
            {ALL_TASK_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 select-none"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700 dark:text-gray-200">{TYPE_LABELS[type]}</span>
              </label>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-1.5 flex justify-between items-center">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
