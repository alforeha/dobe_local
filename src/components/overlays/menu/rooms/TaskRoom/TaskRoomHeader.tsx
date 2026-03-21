type TaskTab = 'stat' | 'resource';

interface TaskRoomHeaderProps {
  activeTab: TaskTab;
  onTabChange: (tab: TaskTab) => void;
}

export function TaskRoomHeader({ activeTab, onTabChange }: TaskRoomHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Tasks</h2>
        <button type="button" className="text-xs text-blue-500 font-medium">
          + Add Task
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        {(['stat', 'resource'] as TaskTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {tab === 'stat' ? 'Stat Tasks' : 'Resource Tasks'}
          </button>
        ))}
      </div>
    </div>
  );
}
