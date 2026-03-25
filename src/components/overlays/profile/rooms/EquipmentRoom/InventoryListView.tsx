import { useMemo } from 'react';
import { resolveIcon } from '../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import type { InventoryItem, InventoryMeta, Resource } from '../../../../../types';

interface InventoryListRow extends InventoryItem {
  resourceName: string;
}

interface InventoryListViewProps {
  className?: string;
}

function isInventoryResource(resource: Resource | undefined): resource is Resource & { meta: InventoryMeta } {
  return !!resource && resource.type === 'inventory' && Array.isArray((resource.meta as InventoryMeta).items);
}

export function InventoryListView({ className = '' }: InventoryListViewProps) {
  const inventoryRefs = useUserStore((state) => state.user?.resources.inventory ?? []);
  const resources = useResourceStore((state) => state.resources);

  const items = useMemo<InventoryListRow[]>(() => {
    return inventoryRefs.flatMap((resourceId) => {
      const resource = resources[resourceId];
      if (!isInventoryResource(resource)) return [];

      return resource.meta.items.map((item) => ({
        ...item,
        resourceName: resource.name,
      }));
    });
  }, [inventoryRefs, resources]);

  return (
    <section className={`flex min-h-0 flex-col rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/80 ${className}`}>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Inventory</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Items pulled from your Inventory resources.</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center">
          <p className="w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
            Add items to your Inventory resources to see them here.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-1">
          <div className="flex h-full gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex h-full min-h-[138px] w-[164px] shrink-0 flex-col rounded-2xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800/70"
              >
                <span className="text-2xl leading-none">{resolveIcon(item.icon)}</span>
                <div className="mt-3 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.name}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {item.quantity}
                    {item.unit ? ` ${item.unit}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{item.resourceName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
