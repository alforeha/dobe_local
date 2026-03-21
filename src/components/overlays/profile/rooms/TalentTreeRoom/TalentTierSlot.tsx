import type { StatGroupKey } from '../../../../../types/user';

/** BUILD-TIME STUB: TalentTierSlot — visual design + spend/reclaim/reset deferred */
interface TalentTierSlotProps {
  tier: number;
  stat: StatGroupKey;
  unlocked: boolean;
}

export function TalentTierSlot({ tier, stat: _stat, unlocked }: TalentTierSlotProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        unlocked
          ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20'
          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-50'
      }`}
    >
      <p className="text-sm font-semibold text-gray-700">Tier {tier}</p>
      <p className="text-xs text-gray-400 mt-1">
        {unlocked ? 'Unlocked' : 'Locked'} · talent design BUILD-time
      </p>
    </div>
  );
}
