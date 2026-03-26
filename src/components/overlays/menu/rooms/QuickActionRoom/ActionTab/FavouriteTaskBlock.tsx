import { useState } from 'react';
import type { TaskTemplate } from '../../../../../../types';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { completeFavourite } from '../../../../../../engine/listsEngine';
import { GlowRing } from '../../../../../shared/GlowRing';
import { ONBOARDING_GLOW } from '../../../../../../constants/onboardingKeys';
import { useGlows } from '../../../../../../hooks/useOnboardingGlow';

interface FavouriteTaskBlockProps {
  templateKey: string;
  template: TaskTemplate;
}

export function FavouriteTaskBlock({ templateKey, template }: FavouriteTaskBlockProps) {
  const [confirming, setConfirming] = useState(false);
  const user = useUserStore((s) => s.user);
  const favouriteActionGlows = useGlows(ONBOARDING_GLOW.FAVOURITE_ACTION);

  function handleConfirm(): void {
    if (!user) return;
    completeFavourite(templateKey, user);
    setConfirming(false);
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <span className="text-base shrink-0">{template.icon || '★'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{template.name}</p>
        <p className="text-xs text-gray-400">{template.taskType}</p>
      </div>
      {confirming ? (
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700"
          >
            x
          </button>
          <GlowRing active={favouriteActionGlows} rounded="lg" className="inline-flex">
            <button
              type="button"
              onClick={handleConfirm}
              className="text-xs text-white px-1.5 py-0.5 rounded bg-green-500"
            >
              OK
            </button>
          </GlowRing>
        </div>
      ) : (
        <GlowRing active={favouriteActionGlows} rounded="lg" className="inline-flex">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs text-blue-500 shrink-0 font-medium"
          >
            Execute
          </button>
        </GlowRing>
      )}
    </div>
  );
}
