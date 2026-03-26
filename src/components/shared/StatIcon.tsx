import type { StatGroupKey } from '../../types';
import { resolveIcon } from '../../constants/iconMap';

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
  /** When false, renders emoji icon instead of text abbreviation (for compact header row) */
  showLabel?: boolean;
  onClick?: () => void;
}

export function StatIcon({ stat, value, size = 'sm', showLabel = true, onClick }: StatIconProps) {
  const label = STAT_LABELS[stat];
  const color = STAT_COLORS[stat];
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';
  const valueSize = size === 'md' ? 'text-base font-bold' : 'text-xs font-semibold';
  const sharedClass = `flex flex-col items-center leading-none ${onClick ? 'cursor-pointer' : 'cursor-default'}`;

  const inner = (
    <>
      {showLabel ? (
        <span className={`${textSize} font-medium ${color}`}>{label}</span>
      ) : (
        <span className="text-sm leading-none">{resolveIcon(stat)}</span>
      )}
      <span className={`${valueSize} text-gray-800 dark:text-gray-100`}>{value}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        aria-label={`${label}: ${value}`}
        onClick={onClick}
        className={sharedClass}
      >
        {inner}
      </button>
    );
  }

  return (
    <div aria-label={`${label}: ${value}`} className={sharedClass}>
      {inner}
    </div>
  );
}
