// ─────────────────────────────────────────
// RecommendedItemsTab — Items sub-view for RecommendationsRoom
// Shows all useable item definitions from ItemLibrary.
// Owned detection (LOCAL v1 loose):
//   - consumable (inventory resourceType): owned if user has any Inventory resource
//   - facility (home resourceType): owned if user has any Home resource
//   - facility (vehicle resourceType): owned if user has any Vehicle resource
// Layout: 2-column card grid.
// Filter by kind, category, and name search.
// ─────────────────────────────────────────

import { useMemo, useState } from 'react';
import { itemLibrary, type ItemCategory, type ItemKind } from '../../../../coach/ItemLibrary';
import { useResourceStore } from '../../../../stores/useResourceStore';

// ── FILTER CONFIG ─────────────────────────────────────────────────────────────

const KIND_OPTIONS: Array<ItemKind | 'all'> = ['all', 'consumable', 'facility'];
const KIND_LABELS: Record<ItemKind | 'all', string> = {
  all: 'All', consumable: 'Consumable', facility: 'Facility',
};

const CATEGORY_OPTIONS: Array<ItemCategory | 'all'> = [
  'all', 'kitchen', 'bedroom', 'cleaning', 'garden', 'vehicle', 'bathroom', 'workspace',
];
const CATEGORY_LABELS: Record<ItemCategory | 'all', string> = {
  all: 'All', kitchen: 'Kitchen', bedroom: 'Bedroom', cleaning: 'Cleaning',
  garden: 'Garden', vehicle: 'Vehicle', bathroom: 'Bathroom', workspace: 'Workspace',
};

// ── KIND BADGE STYLES ─────────────────────────────────────────────────────────

const KIND_BADGE: Record<ItemKind, string> = {
  consumable: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  facility:   'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
};

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RecommendedItemsTab() {
  const resources = useResourceStore((s) => s.resources);

  // Loose owned detection — presence of the resource type is enough for LOCAL v1
  const ownedResourceTypes = useMemo(
    () => new Set(Object.values(resources).map((r) => r.type)),
    [resources],
  );

  const [kindFilter, setKindFilter] = useState<ItemKind | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    let list = itemLibrary;
    if (kindFilter !== 'all') list = list.filter((i) => i.kind === kindFilter);
    if (categoryFilter !== 'all') list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    return list;
  }, [kindFilter, categoryFilter, search]);

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
            placeholder="Search items…"
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

        {/* Kind pills */}
        <div className="flex flex-wrap gap-1">
          {KIND_OPTIONS.map((k) => (
            <FilterPill
              key={k}
              label={KIND_LABELS[k]}
              active={kindFilter === k}
              onClick={() => setKindFilter(k)}
            />
          ))}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1">
          {CATEGORY_OPTIONS.map((c) => (
            <FilterPill
              key={c}
              label={CATEGORY_LABELS[c]}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
            />
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No items match your filter.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {visible.map((item) => {
            const owned = ownedResourceTypes.has(item.resourceType);
            return (
              <ItemCard key={item.id} item={item} owned={owned} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── FILTER PILL ───────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
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

// ── ITEM CARD ─────────────────────────────────────────────────────────────────

import type { ItemDefinition } from '../../../../coach/ItemLibrary';

interface ItemCardProps {
  item: ItemDefinition;
  owned: boolean;
}

function ItemCard({ item, owned }: ItemCardProps) {
  const kindBadge = KIND_BADGE[item.kind];

  return (
    <div
      className={`flex flex-col items-center rounded-lg p-3 gap-2 ring-1 ring-gray-200 dark:ring-gray-700 transition-opacity ${
        owned
          ? 'bg-white dark:bg-gray-800'
          : 'bg-gray-50 dark:bg-gray-900 opacity-60'
      }`}
    >
      {/* Icon */}
      <span
        className="text-3xl leading-none"
        style={owned ? undefined : { filter: 'grayscale(100%)' }}
        aria-hidden="true"
      >
        {item.icon}
      </span>

      {/* Name */}
      <p
        className={`text-xs font-semibold text-center leading-tight ${
          owned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {item.name}
      </p>

      {/* Kind + Category badges */}
      <div className="flex flex-wrap gap-1 justify-center">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${kindBadge}`}>
          {item.kind}
        </span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          {item.category}
        </span>
      </div>
    </div>
  );
}
