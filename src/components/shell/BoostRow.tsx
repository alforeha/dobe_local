import { useUserStore } from '../../stores/useUserStore';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { useSystemStore } from '../../stores/useSystemStore';
import { resolveIcon } from '../../constants/iconMap';
import {
  EARLY_BIRD_MULTIPLIER,
  LATE_NIGHT_MULTIPLIER,
  getXPBoostSnapshot,
} from '../../engine/xpBoosts';

function formatMultiplier(value: number): string {
  const rounded = value.toFixed(1);
  return `${rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded}x`;
}

export function BoostRow() {
  const user = useUserStore((s) => s.user);
  useScheduleStore((s) => s.activeEvents);
  useScheduleStore((s) => s.historyEvents);
  useScheduleStore((s) => s.tasks);
  useSystemStore((s) => s.appTime);
  useSystemStore((s) => s.timeOffset);
  const gold = user?.progression?.gold ?? 0;
  const standardBoosts = getXPBoostSnapshot(user);
  const wisdomBoosts = getXPBoostSnapshot(user, { isWisdomTask: true });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {standardBoosts.earlyBirdActive && (
          <span className="text-xs text-amber-500" title="Early bird boost active">
            {resolveIcon('boost-early-bird')} {formatMultiplier(EARLY_BIRD_MULTIPLIER)}
          </span>
        )}
        {wisdomBoosts.lateNightActive && (
          <span className="text-xs font-semibold text-indigo-600" title="Late night wisdom boost active">
            {resolveIcon('boost-late-night')} {formatMultiplier(LATE_NIGHT_MULTIPLIER)}
          </span>
        )}
        {standardBoosts.streak > 0 && (
          <span className="text-xs text-orange-500" title="Current streak boost">
            {resolveIcon('boost-streak')} {formatMultiplier(standardBoosts.streakMultiplier)}
          </span>
        )}
        {standardBoosts.roll && (
          <span className="text-xs font-semibold text-purple-600" title="Daily roll bonus">
            {resolveIcon('boost-roll')} {standardBoosts.roll.display}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-yellow-600">💰 {gold}</span>
    </div>
  );
}
