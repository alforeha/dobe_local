import { useUserStore } from '../../../../../stores/useUserStore';
import { StatGroupGrid } from './StatGroupGrid';
import { StatGroupBottomBar } from './StatGroupBottomBar';

interface StatGroupRoomProps {
  onTalentTree: () => void;
}

export function StatGroupRoom({ onTalentTree }: StatGroupRoomProps) {
  const stats = useUserStore((s) => s.user?.progression.stats);

  const talents = stats?.talents;
  const talentPoints = stats?.talentPoints ?? 0;

  if (!talents) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        No stat data available.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <StatGroupGrid talents={talents} talentPoints={talentPoints} />
      </div>
      <StatGroupBottomBar talentPoints={talentPoints} onTalentTree={onTalentTree} />
    </div>
  );
}
