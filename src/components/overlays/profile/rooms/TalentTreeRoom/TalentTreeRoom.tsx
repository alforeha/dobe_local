import { useState } from 'react';
import { useUserStore } from '../../../../../stores/useUserStore';
import type { StatGroupKey } from '../../../../../types/user';
import { TalentTreeStatNav } from './TalentTreeStatNav';
import { TalentTreeScroll } from './TalentTreeScroll';

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

export function TalentTreeRoom() {
  const stats = useUserStore((s) => s.user?.progression.stats);

  const talents = stats?.talents;

  // Default: highest stat
  const defaultStat = talents
    ? STAT_ORDER.reduce<StatGroupKey>(
        (best, key) =>
          (talents[key]?.statPoints ?? 0) > (talents[best]?.statPoints ?? 0) ? key : best,
        'health',
      )
    : 'health';

  const [activeStat, setActiveStat] = useState<StatGroupKey>(defaultStat);

  const statPoints = talents
    ? (Object.fromEntries(
        STAT_ORDER.map((k) => [k, talents[k]?.statPoints ?? 0]),
      ) as Record<StatGroupKey, number>)
    : {};

  const unlockedTiers = stats?.talentTree?.[activeStat] ?? {};

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-bold text-gray-700">Talent Tree</h3>
        <p className="text-xs text-gray-400">
          {stats?.talentPoints ?? 0} talent point{stats?.talentPoints !== 1 ? 's' : ''} available
        </p>
      </div>
      <TalentTreeStatNav
        activeStat={activeStat}
        statPoints={statPoints}
        onSelect={setActiveStat}
      />
      <TalentTreeScroll stat={activeStat} unlockedTiers={unlockedTiers} />
    </div>
  );
}
