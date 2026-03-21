// ─────────────────────────────────────────
// InventoryMetaView — read-only display of InventoryMeta. W26.
// ─────────────────────────────────────────

import type { InventoryMeta } from '../../../../../../types/resource';

interface InventoryMetaViewProps {
  meta: InventoryMeta;
}

export function InventoryMetaView({ meta }: InventoryMetaViewProps) {
  const { category, items, lowStockThreshold, notes } = meta;

  const threshold = lowStockThreshold ?? 0;
  const lowItems = items.filter((it) => it.quantity <= threshold);

  const hasAny = category || (items && items.length > 0) || lowStockThreshold != null || notes;

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {category && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Category</span>
          <span>{category}</span>
        </div>
      )}
      {lowStockThreshold != null && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Threshold</span>
          <span>{lowStockThreshold}</span>
        </div>
      )}
      {items && items.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Items</span>
          <div className="flex flex-col gap-0.5 flex-1">
            {items.map((it, idx) => {
              const isLow = it.quantity <= threshold;
              return (
                <span
                  key={it.useableRef + idx}
                  className={`flex items-center gap-1.5 ${
                    isLow ? 'text-amber-700 dark:text-amber-400' : ''
                  }`}
                >
                  {isLow && <span title="Low stock">⚠</span>}
                  <span>{it.name ?? it.useableRef}</span>
                  <span className="text-gray-400">
                    × {it.quantity}
                    {it.unit ? ` ${it.unit}` : ''}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {lowItems.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded px-2 py-1 mt-1">
          <span>⚠</span>
          <span>
            {lowItems.length} item{lowItems.length !== 1 ? 's' : ''} at or below threshold — GTD task active
          </span>
        </div>
      )}
      {notes && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Notes</span>
          <span className="whitespace-pre-line">{notes}</span>
        </div>
      )}
    </div>
  );
}
