import { useEffect, useRef, useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { deriveLevelFromXP } from '../../../engine/awardPipeline';
import type { StatGroupKey } from '../../../types/user';
import { StatIcon } from '../../shared/StatIcon';
import { ProfileXPBar } from './ProfileXPBar';

const STAKE_TIERS: { minLevel: number; emoji: string; label: string }[] = [
  { minLevel: 21, emoji: '\u26FA\uFE0F', label: 'Forest' },
  { minLevel: 11, emoji: '\uD83C\uDF32', label: 'Grove' },
  { minLevel: 6,  emoji: '\uD83C\uDF33', label: 'Sapling' },
  { minLevel: 3,  emoji: '\uD83C\uDF3F', label: 'Sprout' },
  { minLevel: 1,  emoji: '\uD83C\uDF31', label: 'Seed' },
];

function getStake(level: number) {
  for (const tier of STAKE_TIERS) {
    if (level >= tier.minLevel) return tier;
  }
  return STAKE_TIERS[STAKE_TIERS.length - 1];
}

// Local alias — avoids circular import with ProfileOverlay
type ProfileRoom = 'stats' | 'preferences' | 'storage' | 'badges' | 'equipment' | 'talent';

interface ProfileTopSectionProps {
  onNav: (room: ProfileRoom) => void;
}

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

export function ProfileTopSection({ onNav }: ProfileTopSectionProps) {
  const user = useUserStore((s) => s.user);
  const stats = user?.progression.stats;
  const displayName = user?.system.displayName ?? '—';
  const xp = stats?.xp ?? 0;
  const level = deriveLevelFromXP(xp);

  const topStat = STAT_ORDER.reduce<StatGroupKey>(
    (best, key) =>
      (stats?.talents[key]?.statPoints ?? 0) > (stats?.talents[best]?.statPoints ?? 0)
        ? key
        : best,
    'health',
  );
  const topStatValue = stats?.talents[topStat]?.statPoints ?? 0;
  const stake = getStake(level);

  // Measure avatar button width so emoji scales with it
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [avatarPx, setAvatarPx] = useState(0);
  useEffect(() => {
    const el = avatarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setAvatarPx(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const emojiFontSize = avatarPx > 0 ? `${Math.round(avatarPx * 0.45)}px` : '3rem';
  const labelFontSize = avatarPx > 0 ? `${Math.round(avatarPx * 0.08)}px` : '0.75rem';

  return (
    <div className="flex-1 flex flex-col border-b border-gray-100 dark:border-gray-700">

      {/* ── TOP ROW: Preferences + User card; Storage stays abs below close button ── */}
      <div className="relative flex items-center gap-2 px-3 pt-3 pr-24">
        {/* Preferences */}
        <button
          type="button"
          className="shrink-0 flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-md text-3xl hover:scale-105 transition-transform"
          onClick={() => onNav('preferences')}
          aria-label="Preferences"
        >
          👤
        </button>

        {/* User info card — fixed width */}
        <div className="w-44 shrink-0 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 px-3 py-2.5">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate leading-tight">
            {displayName}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            {/* Level badge inline in card */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {level}
            </div>
            <span className="text-gray-300 dark:text-gray-600 select-none">·</span>
            <StatIcon stat={topStat} value={topStatValue} />
          </div>
        </div>

        {/* Storage — abs top-right, offset below overlay close button */}
        <button
          type="button"
          className="absolute top-14 right-3 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-md text-3xl hover:scale-105 transition-transform"
          onClick={() => onNav('storage')}
          aria-label="Storage"
        >
          🔒
        </button>
      </div>

      {/* ── MIDDLE: Avatar fills remaining height; badge/equipment buttons overlay bottom corners ── */}
      <div className="relative flex-1 flex items-center justify-center px-3 pb-3">
        {/* Avatar square — full available height */}
        <button
          ref={avatarRef}
          type="button"
          className="flex flex-col items-center justify-center h-full aspect-square rounded-3xl bg-emerald-50 dark:bg-emerald-900/30 hover:scale-105 transition-transform"
          onClick={() => onNav('stats')}
          aria-label="View stat groups"
        >
          <span className="leading-none" style={{ fontSize: emojiFontSize }}>{stake.emoji}</span>
          <span className="mt-1.5 font-medium text-emerald-700 dark:text-emerald-300 leading-none" style={{ fontSize: labelFontSize }}>
            {stake.label}
          </span>
        </button>

        {/* Badge Room — bottom-left, sits on top of avatar */}
        <button
          type="button"
          className="absolute bottom-3 left-3 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-md text-3xl hover:scale-105 transition-transform z-10"
          onClick={() => onNav('badges')}
          aria-label="Badge Room"
        >
          🏆
        </button>

        {/* Equipment — bottom-right, sits on top of avatar */}
        <button
          type="button"
          className="absolute bottom-3 right-3 flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-md text-3xl hover:scale-105 transition-transform z-10"
          onClick={() => onNav('equipment')}
          aria-label="Equipment"
        >
          🎒
        </button>
      </div>

      {/* ── XP BAR ── */}
      <ProfileXPBar xp={xp} />
    </div>
  );
}
