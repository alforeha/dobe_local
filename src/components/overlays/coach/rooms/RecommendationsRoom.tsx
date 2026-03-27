import { useState } from 'react';
import { LootDropBanner } from './LootDropBanner';
import { RecommendedTasksTab } from './RecommendedTasksTab';
import { RecommendedRoutinesTab } from './RecommendedRoutinesTab';
import { RecommendedGearTab } from './RecommendedGearTab';
import { RecommendedItemsTab } from './RecommendedItemsTab';
import { GlowRing } from '../../../shared/GlowRing';
import { ONBOARDING_GLOW } from '../../../../constants/onboardingKeys';
import { useGlows } from '../../../../hooks/useOnboardingGlow';

type RecTab = 'Tasks' | 'Routines' | 'Gear' | 'Items';

const TAB_CONFIG: { tab: RecTab; icon: string; label: string }[] = [
  { tab: 'Tasks',    icon: '📋', label: 'Tasks' },
  { tab: 'Routines', icon: '🔄', label: 'Routines' },
  { tab: 'Gear',     icon: '⚔️', label: 'Gear' },
  { tab: 'Items',    icon: '📦', label: 'Items' },
];

export function RecommendationsRoom() {
  const [activeTab, setActiveTab] = useState<RecTab>('Tasks');
  const [gearViewed, setGearViewed] = useState(false);
  const tasksTabGlows = useGlows(ONBOARDING_GLOW.RECOMMENDATIONS_TASKS);
  const routinesTabGlows = useGlows(ONBOARDING_GLOW.RECOMMENDATIONS_ROUTINES);

  function handleTabClick(tab: RecTab) {
    setActiveTab(tab);
    if (tab === 'Gear') setGearViewed(true);
  }

  const showGearBadge = !gearViewed;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center gap-2">
          {/* Title */}
          <h3 className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
            Recommendations
          </h3>

          {/* New gear notification badge */}
          {showGearBadge && (
            <button
              type="button"
              onClick={() => handleTabClick('Gear')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-medium whitespace-nowrap hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              New gear
            </button>
          )}

          {/* Icon-only tab nav */}
          <div className="ml-auto flex items-center gap-1 shrink-0">
            {TAB_CONFIG.map(({ tab, icon, label }) => (
              <GlowRing
                key={tab}
                active={
                  (tab === 'Tasks' && tasksTabGlows) ||
                  (tab === 'Routines' && routinesTabGlows)
                }
                rounded="lg"
                className="inline-flex"
              >
                <button
                  type="button"
                  aria-label={label}
                  onClick={() => handleTabClick(tab)}
                  className={`flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-base" aria-hidden="true">{icon}</span>
                  <span className="ml-2 hidden sm:inline">{label}</span>
                </button>
              </GlowRing>
            ))}
          </div>
        </div>
      </div>

      <LootDropBanner />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'Tasks' && <RecommendedTasksTab />}
        {activeTab === 'Routines' && <RecommendedRoutinesTab />}
        {activeTab === 'Gear' && <RecommendedGearTab />}
        {activeTab === 'Items' && <RecommendedItemsTab />}
      </div>
    </div>
  );
}
