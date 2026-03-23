import { useState } from 'react';
import { TabButton } from '../../../../components/shared/buttons/TabButton';
import { LootDropBanner } from './LootDropBanner';
import { RecommendedTasksTab } from './RecommendedTasksTab';
import { RecommendedRoutinesTab } from './RecommendedRoutinesTab';

type RecTab = 'Tasks' | 'Routines' | 'Gear' | 'Items';
const TABS: RecTab[] = ['Tasks', 'Routines', 'Gear', 'Items'];

export function RecommendationsRoom() {
  const [activeTab, setActiveTab] = useState<RecTab>('Tasks');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">Recommendations</h3>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </div>

      <LootDropBanner />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'Tasks' && <RecommendedTasksTab />}
        {activeTab === 'Routines' && <RecommendedRoutinesTab />}
        {(activeTab === 'Gear' || activeTab === 'Items') && (
          <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Coming soon.
          </div>
        )}
      </div>
    </div>
  );
}
