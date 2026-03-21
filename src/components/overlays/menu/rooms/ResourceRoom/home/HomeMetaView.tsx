// ─────────────────────────────────────────
// HomeMetaView — read-only display of HomeMeta. W23.
// ─────────────────────────────────────────

import type { HomeMeta } from '../../../../../../types/resource';

interface HomeMetaViewProps {
  meta: HomeMeta;
}

export function HomeMetaView({ meta }: HomeMetaViewProps) {
  const { address, rooms, notes } = meta;

  const hasAny = address || (rooms && rooms.length > 0) || notes;

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {address && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Address</span>
          <span>{address}</span>
        </div>
      )}
      {rooms && rooms.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Rooms</span>
          <div className="flex flex-wrap gap-1">
            {rooms.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded"
              >
                {r.icon && <span>{r.icon}</span>}
                <span>{r.name}</span>
              </span>
            ))}
          </div>
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
