import { useUserStore } from '../../../stores/useUserStore';
import type { StatGroupKey } from '../../../types/user';
import { ProgressiveAvatar } from './ProgressiveAvatar';
import { AvatarFloatingCard } from './AvatarFloatingCard';
import { ProfileXPBar } from './ProfileXPBar';
import { TrophyShortcut } from './TrophyShortcut';
import { BackpackShortcut } from './BackpackShortcut';

interface ProfileTopSectionProps {
  onAvatarClick: () => void;
  onBadgesClick: () => void;
  onEquipmentClick: () => void;
}

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

export function ProfileTopSection({ onAvatarClick, onBadgesClick, onEquipmentClick }: ProfileTopSectionProps) {
  const user = useUserStore((s) => s.user);
  const stats = user?.progression.stats;
  const displayName = user?.system.displayName ?? '—';
  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;

  const topStat = STAT_ORDER.reduce<StatGroupKey>(
    (best, key) =>
      (stats?.talents[key]?.statPoints ?? 0) > (stats?.talents[best]?.statPoints ?? 0)
        ? key
        : best,
    'health',
  );
  const topStatValue = stats?.talents[topStat]?.statPoints ?? 0;

  return (
    <div className="shrink-0 border-b border-gray-100 pb-4 pt-6">
      {/* Avatar row */}
      <div className="flex items-end justify-center gap-8 px-6">
        <TrophyShortcut onClick={onBadgesClick} />

        <div className="flex flex-col items-center gap-2">
          <AvatarFloatingCard
            displayName={displayName}
            topStat={topStat}
            topStatValue={topStatValue}
          />
          <ProgressiveAvatar level={level} onClick={onAvatarClick} />
        </div>

        <BackpackShortcut onClick={onEquipmentClick} />
      </div>

      <ProfileXPBar xp={xp} level={level} />
    </div>
  );
}
