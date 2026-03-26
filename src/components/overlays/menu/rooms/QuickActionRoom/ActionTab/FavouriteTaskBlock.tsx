import { useState } from 'react';
import type { Task, TaskTemplate } from '../../../../../../types';
import type { InputFields, XpAward } from '../../../../../../types/taskTemplate';
import type { StatGroupKey } from '../../../../../../types/user';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { completeFavourite } from '../../../../../../engine/listsEngine';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { GlowRing } from '../../../../../shared/GlowRing';
import { ONBOARDING_GLOW } from '../../../../../../constants/onboardingKeys';
import { useGlows } from '../../../../../../hooks/useOnboardingGlow';
import { TaskTypeInputRenderer } from '../../../../event/TaskTypeInputRenderer';

interface FavouriteTaskBlockProps {
  templateKey: string;
  template: TaskTemplate;
}

const STAT_KEYS: StatGroupKey[] = [
  'health',
  'strength',
  'agility',
  'defense',
  'charisma',
  'wisdom',
];

function getPrimaryStatKey(xpAward: XpAward): StatGroupKey | null {
  let best: StatGroupKey | null = null;
  let bestVal = 0;
  for (const key of STAT_KEYS) {
    const value = xpAward[key];
    if (value > bestVal) {
      bestVal = value;
      best = key;
    }
  }
  return best;
}

export function FavouriteTaskBlock({ templateKey, template }: FavouriteTaskBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const user = useUserStore((s) => s.user);
  const favouriteActionGlows = useGlows(ONBOARDING_GLOW.FAVOURITE_ACTION);
  const statKey = getPrimaryStatKey(template.xpAward);

  const previewTask: Task = {
    id: `favourite-preview-${templateKey}`,
    templateRef: templateKey,
    completionState: 'pending',
    completedAt: null,
    resultFields: {},
    attachmentRef: null,
    resourceRef: null,
    location: null,
    sharedWith: null,
    questRef: null,
    actRef: null,
    secondaryTag: template.secondaryTag,
  };

  function handleComplete(resultFields: Partial<InputFields>) {
    if (!user) return;
    completeFavourite(templateKey, user, resultFields);
    setExpanded(false);
  }

  return (
    <GlowRing active={favouriteActionGlows} rounded="lg" className="block">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center gap-3 px-3 py-3 text-left"
        >
          <span className="text-lg leading-none">{resolveIcon(statKey ?? 'agility')}</span>
          <span className="text-xl leading-none">{resolveIcon(template.icon)}</span>
          <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
            {template.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-300">
            {resolveIcon(expanded ? 'collapse' : 'expand')}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-700">
            {template.description && (
              <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                {template.description}
              </p>
            )}
            <TaskTypeInputRenderer
              taskType={template.taskType}
              template={template}
              task={previewTask}
              onComplete={handleComplete}
            />
          </div>
        )}
      </div>
    </GlowRing>
  );
}
