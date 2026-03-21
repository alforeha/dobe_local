import { useUserStore } from '../../../../../stores/useUserStore';
import type { Badge } from '../../../../../types/itemTemplate';

/**
 * BUILD-TIME STUB: BadgeBoardCanvas — free-form drag placement.
 * Drag-and-drop is deferred. Currently renders a pinned badge list.
 */
export function BadgeBoardCanvas() {
  const badges = useUserStore((s) => s.user?.progression.badgeBoard.pinned) ?? [];

  return (
    <div className="relative flex-1 min-h-48 bg-gray-50 dark:bg-gray-800 rounded border border-dashed border-gray-300 dark:border-gray-600">
      {badges.length === 0 ? (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
          No badges placed yet
        </p>
      ) : (
        <div className="flex flex-wrap gap-3 p-3">
          {badges.map((badge: Badge) => (
            <div
              key={badge.id}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-2xl"
              title={badge.name}
            >
              🏅
            </div>
          ))}
        </div>
      )}
      <p className="absolute bottom-1 right-2 text-xs text-gray-300">drag placement — BUILD-time</p>
    </div>
  );
}
