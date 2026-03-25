// ─────────────────────────────────────────
// InventoryMetaView — read-only display of InventoryMeta. W26 / H.
// Low-stock amber dot only shown when a GTD task for that item is pending.
// ─────────────────────────────────────────

import type { Resource, InventoryMeta } from '../../../../../../types/resource';
import type { Task } from '../../../../../../types/task';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { NotesLogViewer } from '../../../../../shared/NotesLogViewer';

interface InventoryMetaViewProps {
  meta: InventoryMeta;
  resource: Resource;
}

export function InventoryMetaView({ meta, resource }: InventoryMetaViewProps) {
  const allResources = useResourceStore((s) => s.resources);
  const scheduleTasks = useScheduleStore((s) => s.tasks) as Record<string, Task>;
  const user = useUserStore((s) => s.user);

  const { category, items, linkedResourceRefs, notes } = meta;

  // Build set of item names that currently have a pending GTD task for this resource
  const gtdTaskIds = new Set(user?.lists.gtdList ?? []);
  const lowStockItemNames = new Set(
    Object.values(scheduleTasks)
      .filter(
        (t) =>
          t.resourceRef === resource.id &&
          t.completionState === 'pending' &&
          gtdTaskIds.has(t.id),
      )
      .map((t) => (t.resultFields as Record<string, string> | undefined)?.itemName)
      .filter((n): n is string => Boolean(n)),
  );

  // Linked resources resolved from store
  const linkedResolved = (linkedResourceRefs ?? [])
    .map((id) => allResources[id] ?? null)
    .filter(Boolean);

  // Reverse lookup: resources that reference this inventory
  const linkedReverse = Object.values(allResources).filter((r) => {
    if (r.id === resource.id) return false;
    if (r.type === 'inventory') {
      return (r.meta as InventoryMeta).linkedResourceRefs?.includes(resource.id);
    }
    return false;
  });

  const allLinked = [...linkedResolved, ...linkedReverse];

  const hasAny =
    category ||
    (items && items.length > 0) ||
    allLinked.length > 0 ||
    (notes && notes.length > 0);

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {/* Icon + name header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl leading-none shrink-0" aria-hidden="true">
          {resolveIcon(resource.icon)}
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {resource.name}
        </span>
      </div>

      {category && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Category</span>
          <span>{category}</span>
        </div>
      )}

      {/* Linked */}
      {allLinked.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Linked</span>
          <div className="flex flex-wrap gap-1">
            {allLinked.map((r) => (
              <span
                key={r!.id}
                className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs"
              >
                {resolveIcon(r!.icon)}
                <span>{r!.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Item list */}
      {items && items.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Items</span>
          <div className="flex flex-col gap-0.5 flex-1">
            {items.map((it) => {
              const isLowStock = lowStockItemNames.has(it.name);
              return (
                <span key={it.id} className="flex items-center gap-1.5">
                  {/* Low-stock amber dot — only when GTD task is active */}
                  {isLowStock && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"
                      title="Low stock — GTD task active"
                    />
                  )}
                  {it.icon && <span>{it.icon}</span>}
                  <span className={isLowStock ? 'text-amber-600 dark:text-amber-400' : ''}>
                    {it.name}
                  </span>
                  <span className="text-gray-400">
                    × {it.quantity}
                    {it.unit ? ` ${it.unit}` : ''}
                  </span>
                  {it.threshold != null && (
                    <span className="text-gray-400">(low: {it.threshold})</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      <NotesLogViewer notes={notes} />
    </div>
  );
}
