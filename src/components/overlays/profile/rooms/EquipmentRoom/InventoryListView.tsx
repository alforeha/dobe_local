import { useUserStore } from '../../../../../stores/useUserStore';

export function InventoryListView() {
  const equipment = useUserStore((s) => s.user?.progression.equipment.equipment) ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inventory</p>
      {equipment.length === 0 ? (
        <p className="text-sm text-gray-400">No items owned yet.</p>
      ) : (
        <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {equipment.map((gearId) => (
            <li key={gearId} className="flex items-center gap-3 py-2 text-sm text-gray-700">
              <span className="text-lg">🎒</span>
              <span className="flex-1 truncate text-xs text-gray-500">{gearId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
