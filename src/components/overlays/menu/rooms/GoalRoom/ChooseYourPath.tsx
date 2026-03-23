import { useProgressionStore } from '../../../../../stores/useProgressionStore';
import { STARTER_ACT_IDS, unlockAct } from '../../../../../coach/StarterQuestLibrary';

const STAT_PATHS = [
  { id: STARTER_ACT_IDS.health,   label: 'Health',   emoji: '❤️' },
  { id: STARTER_ACT_IDS.strength, label: 'Strength', emoji: '💪' },
  { id: STARTER_ACT_IDS.agility,  label: 'Agility',  emoji: '⚡' },
  { id: STARTER_ACT_IDS.defense,  label: 'Defense',  emoji: '🛡️' },
  { id: STARTER_ACT_IDS.charisma, label: 'Charisma', emoji: '✨' },
  { id: STARTER_ACT_IDS.wisdom,   label: 'Wisdom',   emoji: '📚' },
] as const;

/**
 * "Choose Your Path" section — shown in the Adventures tab after the Daily
 * Adventure is unlocked (Onboarding Act complete, D87).
 * Lets the user activate one or more stat path Acts. Multiple paths allowed.
 */
export function ChooseYourPath() {
  const acts = useProgressionStore((s) => s.acts);

  return (
    <div className="mx-4 mt-3 mb-1 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Choose a stat path to begin your journey
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Activate any path — you can unlock multiple.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        {STAT_PATHS.map(({ id, label, emoji }) => {
          const isUnlocked = !!acts[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => { if (!isUnlocked) unlockAct(id); }}
              disabled={isUnlocked}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isUnlocked
                  ? 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400 cursor-default'
                  : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-800/40 cursor-pointer'
              }`}
            >
              <span className="text-base shrink-0">{emoji}</span>
              <span className="flex-1 text-left">{label}</span>
              {isUnlocked && (
                <span className="text-xs font-normal opacity-70">Active</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
