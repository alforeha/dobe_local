import type { StatGroupKey } from '../../../../../types/user';
import { StatIcon } from '../../../../shared/StatIcon';

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

interface TalentTreeStatNavProps {
  activeStat: StatGroupKey;
  statPoints: Partial<Record<StatGroupKey, number>>;
  onSelect: (stat: StatGroupKey) => void;
}

export function TalentTreeStatNav({ activeStat, statPoints, onSelect }: TalentTreeStatNavProps) {
  return (
    <div className="shrink-0 flex gap-1 overflow-x-auto border-b border-gray-100 dark:border-gray-700 px-4 py-2">
      {STAT_ORDER.map((stat) => (
        <button
          key={stat}
          type="button"
          className={`shrink-0 rounded px-2 py-1 ${
            activeStat === stat ? 'bg-indigo-100 dark:bg-indigo-900/30 ring-1 ring-indigo-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => onSelect(stat)}
        >
          <StatIcon stat={stat} value={statPoints[stat] ?? 0} />
        </button>
      ))}
    </div>
  );
}
