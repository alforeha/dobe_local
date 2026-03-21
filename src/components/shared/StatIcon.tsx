import type { StatGroupKey } from '../../types';

const STAT_LABELS: Record<StatGroupKey, string> = {
  health: 'HP',
  strength: 'STR',
  agility: 'AGI',
  defense: 'DEF',
  charisma: 'CHA',
  wisdom: 'WIS',
};

const STAT_COLORS: Record<StatGroupKey, string> = {
  health: 'text-red-500',
  strength: 'text-orange-500',
  agility: 'text-green-500',
  defense: 'text-blue-500',
  charisma: 'text-pink-500',
  wisdom: 'text-purple-500',
};

interface StatIconProps {
  stat: StatGroupKey;
  value: number;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export function StatIcon({ stat, value, size = 'sm', onClick }: StatIconProps) {
  const label = STAT_LABELS[stat];
  const color = STAT_COLORS[stat];
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';
  const valueSize = size === 'md' ? 'text-base font-bold' : 'text-xs font-semibold';

  return (
    <button
      type="button"
      aria-label={`${label}: ${value}`}
      onClick={onClick}
      className={`flex flex-col items-center leading-none ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className={`${textSize} font-medium ${color}`}>{label}</span>
      <span className={`${valueSize} text-gray-800`}>{value}</span>
    </button>
  );
}
