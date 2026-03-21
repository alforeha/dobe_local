import { useUserStore } from '../../stores/useUserStore';
import { StatIcon } from '../shared/StatIcon';
import type { StatGroupKey } from '../../types';

const STAT_KEYS: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

export function StatRow() {
  const user = useUserStore((s) => s.user);
  const talents = user?.progression?.stats?.talents;

  return (
    <div className="flex items-center gap-2">
      {STAT_KEYS.map((key) => (
        <StatIcon
          key={key}
          stat={key}
          value={talents?.[key]?.statPoints ?? 0}
          size="sm"
        />
      ))}
    </div>
  );
}
