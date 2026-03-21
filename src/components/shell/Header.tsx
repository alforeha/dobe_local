import { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { ProfileNavButton } from './ProfileNavButton';
import { XPBar } from './XPBar';
import { StatRow } from './StatRow';
import { BoostRow } from './BoostRow';
import { FloatingDelta } from './FloatingDelta';

interface HeaderProps {
  onProfileOpen: () => void;
}

function computeLevel(xp: number): number {
  // Simple level curve: 1000 XP per level
  return Math.floor(xp / 1000) + 1;
}

function computeXPProgress(xp: number): { current: number; max: number } {
  const levelXP = xp % 1000;
  return { current: levelXP, max: 1000 };
}

export interface DeltaItem {
  id: string;
  label: string;
}

export function Header({ onProfileOpen }: HeaderProps) {
  const user = useUserStore((s) => s.user);
  const [deltas, setDeltas] = useState<DeltaItem[]>([]);
  const prevXP = useRef<number | null>(null);

  const stats = user?.progression?.stats;
  const xp = stats?.xp ?? 0;
  const level = computeLevel(xp);
  const xpProgress = computeXPProgress(xp);

  // Detect XP changes and fire floating delta
  useEffect(() => {
    if (prevXP.current !== null && prevXP.current !== xp) {
      const diff = xp - prevXP.current;
      const id = `xp-${Date.now()}`;
      setDeltas((d) => [...d, { id, label: `${diff > 0 ? '+' : ''}${diff} XP` }]);
    }
    prevXP.current = xp;
  }, [xp]);

  const dismissDelta = (id: string) => {
    setDeltas((d) => d.filter((item) => item.id !== id));
  };

  return (
    <header className="relative flex shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2">
      <ProfileNavButton onOpen={onProfileOpen} />

      <div className="flex flex-1 flex-col gap-0.5">
        <XPBar
          displayName={user?.system?.displayName ?? '—'}
          level={level}
          current={xpProgress.current}
          max={xpProgress.max}
        />
        <StatRow />
        <BoostRow />
      </div>

      {deltas.map((d) => (
        <FloatingDelta key={d.id} label={d.label} onDismiss={() => dismissDelta(d.id)} />
      ))}
    </header>
  );
}
