type GoalTab = 'habitats' | 'adventures';

interface GoalRoomHeaderProps {
  activeTab: GoalTab;
  onTabChange: (tab: GoalTab) => void;
}

export function GoalRoomHeader({ activeTab, onTabChange }: GoalRoomHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Goals</h2>
        {activeTab === 'habitats' && (
          <button type="button" className="text-xs text-blue-500 font-medium">
            + Add Act
          </button>
        )}
      </div>
      <div className="flex gap-2 mt-2">
        {(['habitats', 'adventures'] as GoalTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`text-sm px-3 py-1 rounded-full capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
