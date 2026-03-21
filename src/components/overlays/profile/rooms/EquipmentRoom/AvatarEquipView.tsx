import { useUserStore } from '../../../../../stores/useUserStore';

/**
 * BUILD-TIME STUB: AvatarEquipView
 * Slot display resolves from CharacterLibrary (app bundle) at runtime.
 */
export function AvatarEquipView() {
  const equippedGear = useUserStore((s) => s.user?.progression.avatar.equippedGear);
  const slots = equippedGear ? Object.entries(equippedGear) : [];

  return (
    <div className="flex h-full gap-4">
      {/* Slot display */}
      <div className="w-1/2 rounded bg-gray-50 dark:bg-gray-800 p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Equipped</p>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-400">No gear equipped</p>
        ) : (
          <ul className="space-y-2">
            {slots.map(([slot, gearId]) => (
              <li key={slot} className="flex items-center gap-2 text-sm">
                <span className="text-gray-500 capitalize w-20 shrink-0">{slot}</span>
                <span className="text-gray-700 text-xs truncate">{gearId}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-gray-300">slot taxonomy — BUILD-time</p>
      </div>

      {/* Gear list */}
      <div className="flex-1 overflow-y-auto rounded bg-gray-50 dark:bg-gray-800 p-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gear</p>
        <p className="text-sm text-gray-400">CharacterLibrary resolution — BUILD-time</p>
      </div>
    </div>
  );
}
