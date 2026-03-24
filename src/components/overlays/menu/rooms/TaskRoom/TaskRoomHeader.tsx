type TaskTab = 'stat' | 'resource';

const TAB_ICONS: Record<TaskTab, string> = {
  stat: '⭐',
  resource: '💰',
};

const TAB_LABELS: Record<TaskTab, string> = {
  stat: 'Stat Tasks',
  resource: 'Resource Tasks',
};

interface TaskRoomHeaderProps {
  activeTab: TaskTab;
  onTabChange: (tab: TaskTab) => void;
  onAdd: () => void;
}

export function TaskRoomHeader({ activeTab, onTabChange, onAdd }: TaskRoomHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 border-b border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Tasks</h2>
        <div className="flex items-center gap-1">
          {(['stat', 'resource'] as TaskTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-label={TAB_LABELS[tab]}
              title={TAB_LABELS[tab]}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {TAB_ICONS[tab]}
            </button>
          ))}
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add task template"
            title="Add Task"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 transition-colors text-lg font-light ml-1"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
