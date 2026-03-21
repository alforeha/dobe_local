import { useUserStore } from '../../../stores/useUserStore';
import type { StatGroupKey } from '../../../types/user';
import { ProgressiveAvatar } from './ProgressiveAvatar';
import { StatIcon } from '../../shared/StatIcon';

// Local alias — avoids circular import with ProfileOverlay
type ProfileRoom = 'stats' | 'preferences' | 'storage' | 'badges' | 'equipment' | 'talent';

interface ProfileTopSectionProps {
  onNav: (room: ProfileRoom) => void;
}

const STAT_ORDER: StatGroupKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

interface CornerButtonProps {
  positionClass: string;
  icon: string;
  label: string;
  onClick: () => void;
}

function CornerButton({ positionClass, icon, label, onClick }: CornerButtonProps) {
  return (
    <button
      type="button"
      className={`absolute ${positionClass} flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-md text-3xl hover:scale-105 transition-transform`}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export function ProfileTopSection({ onNav }: ProfileTopSectionProps) {
  const user = useUserStore((s) => s.user);
  const stats = user?.progression.stats;
  const displayName = user?.system.displayName ?? '—';
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
    <div className="flex-1 relative flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
      {/* Top-left: profile pic → Preferences */}
      <CornerButton
        positionClass="top-3 left-3"
        icon="👤"
        label="Preferences"
        onClick={() => onNav('preferences')}
      />
      {/* Top-right: lock → Storage — offset below close button */}
      <CornerButton
        positionClass="top-14 right-3"
        icon="🔒"
        label="Storage"
        onClick={() => onNav('storage')}
      />
      {/* Bottom-left: trophy → Badge Room */}
      <CornerButton
        positionClass="bottom-3 left-3"
        icon="🏆"
        label="Badge Room"
        onClick={() => onNav('badges')}
      />
      {/* Bottom-right: backpack → Equipment */}
      <CornerButton
        positionClass="bottom-3 right-3"
        icon="🎒"
        label="Equipment"
        onClick={() => onNav('equipment')}
      />

      {/* Centre: circular avatar, display name, top stat badge */}
      <div className="flex flex-col items-center gap-2">
        <ProgressiveAvatar level={level} onClick={() => onNav('stats')} />
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{displayName}</p>
        <StatIcon stat={topStat} value={topStatValue} />
      </div>
    </div>
  );
}
