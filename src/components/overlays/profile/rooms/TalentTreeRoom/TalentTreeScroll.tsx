import type { StatGroupKey } from '../../../../../types/user';
import { TalentTierSlot } from './TalentTierSlot';

const TIERS = [1, 2, 3, 4, 5];

interface TalentTreeScrollProps {
  stat: StatGroupKey;
  unlockedTiers: Record<string, boolean>;
}

export function TalentTreeScroll({ stat, unlockedTiers }: TalentTreeScrollProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
      {TIERS.map((tier) => (
        <TalentTierSlot
          key={tier}
          tier={tier}
          stat={stat}
          unlocked={!!unlockedTiers[`tier${tier}`]}
        />
      ))}
    </div>
  );
}
