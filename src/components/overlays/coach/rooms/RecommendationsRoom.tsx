import { useState } from 'react';
import { TabButton } from '../../../../components/shared/buttons/TabButton';
import { RecommendationCard } from './RecommendationCard';
import { LootDropBanner } from './LootDropBanner';

type RecTab = 'Tasks' | 'Routines' | 'Gear' | 'Items';
const TABS: RecTab[] = ['Tasks', 'Routines', 'Gear', 'Items'];

export function RecommendationsRoom() {
  const [activeTab, setActiveTab] = useState<RecTab>('Tasks');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-2">
        <h3 className="mb-2 text-sm font-bold text-gray-700">Recommendations</h3>
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

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {/* Placeholder items — plugs into RecommendationsLibrary at BUILD-time */}
        {['Sample recommendation 1', 'Sample recommendation 2'].map((name) => (
          <RecommendationCard key={name} name={name} owned={false} tab={activeTab} />
        ))}
      </div>
    </div>
  );
}
