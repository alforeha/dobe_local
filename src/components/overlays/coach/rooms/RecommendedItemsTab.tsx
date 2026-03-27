import { useMemo, useState } from 'react';
import { itemLibrary, type ItemCategory, type ItemDefinition, type ItemKind } from '../../../../coach/ItemLibrary';
import { resolveIcon } from '../../../../constants/iconMap';
import { useResourceStore } from '../../../../stores/useResourceStore';
import type { InventoryItem, InventoryMeta, Resource } from '../../../../types/resource';

type OwnedFilter = 'all' | 'used';

const CATEGORIES: Array<ItemCategory | 'all'> = [
  'all',
  'kitchen',
  'bedroom',
  'cleaning',
  'garden',
  'vehicle',
  'bathroom',
  'workspace',
];

const FACILITY_TASK_STUBS: Record<string, string[]> = {
  'item-bed': ['Make Bed (daily)', 'Clean Sheets (weekly)'],
  'item-car': ['Weekly Car Check (weekly)'],
  'item-oven': ['Clean Oven (monthly)'],
  'item-garden': ['Water Plants (daily)'],
  'item-washing-machine': ['Run Wash (as needed)'],
  'item-fridge': ['Clean Fridge (monthly)'],
  'item-desk': ['Clear Desk (daily)'],
  'item-shower': ['Clean Shower (weekly)'],
  'item-lawnmower': ['Mow Lawn (weekly)'],
  'item-bicycle': ['Check Tyre Pressure (weekly)'],
};

function isInventoryResource(resource: Resource | undefined): resource is Resource & { meta: InventoryMeta } {
  return !!resource && resource.type === 'inventory' && Array.isArray((resource.meta as InventoryMeta).items);
}

function humanizeTaskRef(taskRef: string): string {
  return taskRef
    .replace(/^item-tmpl-/, '')
    .replace(/-\d+$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function RecommendedItemsTab() {
  const resources = useResourceStore((state) => state.resources);
  const setResource = useResourceStore((state) => state.setResource);

  const [search, setSearch] = useState('');
  const [ownedFilter, setOwnedFilter] = useState<OwnedFilter>('all');
  const [kindFilter, setKindFilter] = useState<ItemKind | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectorItemId, setSelectorItemId] = useState<string | null>(null);
  const [selectedInventoryId, setSelectedInventoryId] = useState('');

  const inventoryResources = useMemo(
    () => Object.values(resources).filter((resource): resource is Resource & { meta: InventoryMeta } => isInventoryResource(resource)),
    [resources],
  );

  const ownership = useMemo(() => {
    const ownershipMap: Record<string, { item: InventoryItem; resource: Resource & { meta: InventoryMeta } }[]> = {};

    for (const resource of inventoryResources) {
      for (const item of resource.meta.items) {
        if (!ownershipMap[item.id]) ownershipMap[item.id] = [];
        ownershipMap[item.id].push({ item, resource });
      }
    }

    return ownershipMap;
  }, [inventoryResources]);

  const visible = useMemo(() => {
    return itemLibrary.filter((item) => {
      const owned = (ownership[item.id]?.length ?? 0) > 0;
      if (ownedFilter === 'used' && !owned) return false;
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        if (!item.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [categoryFilter, kindFilter, ownedFilter, ownership, search]);

  const expandedItem = visible.find((item) => item.id === expandedId) ?? null;

  function handleAddToInventory(item: ItemDefinition) {
    if (!selectedInventoryId) return;
    const inventory = resources[selectedInventoryId];
    if (!isInventoryResource(inventory)) return;

    const existingIndex = inventory.meta.items.findIndex((entry) => entry.id === item.id);
    const linkedResourceRef = item.kind === 'facility'
      ? Object.values(resources).find((resource) => resource.type === item.resourceType)?.id ?? null
      : undefined;

    const nextItems = [...inventory.meta.items];
    if (existingIndex >= 0) {
      const existing = nextItems[existingIndex];
      if (!existing) return;
      nextItems[existingIndex] = { ...existing, quantity: existing.quantity + 1 };
    } else {
      nextItems.push({
        id: item.id,
        icon: item.icon,
        name: item.name,
        quantity: 1,
        linkedResourceRef: linkedResourceRef ?? undefined,
      });
    }

    setResource({
      ...inventory,
      meta: {
        ...inventory.meta,
        items: nextItems,
      },
    });

    setSelectorItemId(null);
    setSelectedInventoryId('');
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-3 pb-2">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search items..."
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-9 text-sm text-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear item search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-lg leading-none text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              ) : null}
            </div>
            <TogglePill label="Used" active={ownedFilter === 'used'} onClick={() => setOwnedFilter('used')} />
            <TogglePill label="All" active={ownedFilter === 'all'} onClick={() => setOwnedFilter('all')} />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              <TogglePill label="Consumable" active={kindFilter === 'consumable'} onClick={() => setKindFilter('consumable')} />
              <TogglePill label="Facility" active={kindFilter === 'facility'} onClick={() => setKindFilter('facility')} />
              <TogglePill label="Both" active={kindFilter === 'all'} onClick={() => setKindFilter('all')} />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as ItemCategory | 'all')}
              className="ml-auto min-h-10 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Tags' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 pb-4">
        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No items match the current filters.
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visible.map((item) => {
            const owned = (ownership[item.id]?.length ?? 0) > 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setExpandedId((current) => current === item.id ? null : item.id);
                  setSelectorItemId(null);
                  setSelectedInventoryId('');
                }}
                className={`aspect-square overflow-hidden rounded-2xl border p-3 text-center shadow-sm transition-transform hover:-translate-y-0.5 dark:border-gray-700 ${
                  expandedId === item.id ? 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900/40' : 'border-gray-200'
                } ${owned ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}
              >
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <span
                    className="text-5xl leading-none"
                    style={owned ? undefined : { filter: 'grayscale(100%)' }}
                    aria-hidden="true"
                  >
                    {resolveIcon(item.icon)}
                  </span>
                  <p className={`text-sm font-semibold leading-tight ${owned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.name}
                  </p>
                  {owned ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Used
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {expandedItem ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4" onClick={() => setExpandedId(null)}>
            <div
              className="max-h-[85%] w-full max-w-xl overflow-y-auto rounded-3xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
              onClick={(event) => event.stopPropagation()}
            >
              <ExpandedItemPanel
                item={expandedItem}
                ownership={ownership[expandedItem.id] ?? []}
                resources={resources}
                inventoryResources={inventoryResources}
                selectorOpen={selectorItemId === expandedItem.id}
                selectedInventoryId={selectedInventoryId}
                onClose={() => setExpandedId(null)}
                onOpenSelector={() => {
                  setSelectorItemId(expandedItem.id);
                  setSelectedInventoryId(inventoryResources[0]?.id ?? '');
                }}
                onSelectInventory={setSelectedInventoryId}
                onConfirmAdd={() => handleAddToInventory(expandedItem)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

interface ExpandedItemPanelProps {
  item: ItemDefinition;
  ownership: Array<{ item: InventoryItem; resource: Resource & { meta: InventoryMeta } }>;
  resources: Record<string, Resource>;
  inventoryResources: Array<Resource & { meta: InventoryMeta }>;
  selectorOpen: boolean;
  selectedInventoryId: string;
  onClose: () => void;
  onOpenSelector: () => void;
  onSelectInventory: (inventoryId: string) => void;
  onConfirmAdd: () => void;
}

function ExpandedItemPanel({
  item,
  ownership,
  resources,
  inventoryResources,
  selectorOpen,
  selectedInventoryId,
  onClose,
  onOpenSelector,
  onSelectInventory,
  onConfirmAdd,
}: ExpandedItemPanelProps) {
  const owned = ownership.length > 0;
  const linkedResourceName = ownership
    .map((entry) => entry.item.linkedResourceRef ? resources[entry.item.linkedResourceRef]?.name ?? null : null)
    .find((name): name is string => !!name);

  const taskList = item.kind === 'facility'
    ? (FACILITY_TASK_STUBS[item.id] ?? (item.associatedTaskTemplateRef ? [`${humanizeTaskRef(item.associatedTaskTemplateRef)} (stub)`] : ['No generated tasks yet']))
    : [];

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gray-50 text-5xl dark:bg-gray-900/40">
            {resolveIcon(item.icon)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h4>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {item.kind}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {item.category}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>

      {item.kind === 'facility' ? (
        <div className="mt-4 rounded-2xl bg-gray-50 px-3 py-3 dark:bg-gray-900/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Generated Tasks</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">{taskList.join(', ')}</p>
        </div>
      ) : null}

      {owned ? (
        <div className="mt-4 rounded-2xl bg-gray-50 px-3 py-3 dark:bg-gray-900/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Used By</p>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
            {linkedResourceName ? linkedResourceName : ownership[0]?.resource.name ?? 'Inventory'}
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        {!owned ? (
          <>
            <button
              type="button"
              onClick={onOpenSelector}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
            >
              Add to Inventory
            </button>
            {selectorOpen ? (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                {inventoryResources.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create an Inventory resource first.</p>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={selectedInventoryId}
                      onChange={(event) => onSelectInventory(event.target.value)}
                      className="min-h-10 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      {inventoryResources.map((resource) => (
                        <option key={resource.id} value={resource.id}>{resource.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={onConfirmAdd}
                      className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </>
        ) : (
          <span className="inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            Go to Resources
          </span>
        )}
      </div>
    </>
  );
}
