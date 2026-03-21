import type { ResourceType } from '../../../../../types/resource';

const RESOURCE_TYPES: ResourceType[] = [
  'contact',
  'home',
  'vehicle',
  'account',
  'inventory',
  'doc',
];

const TYPE_ICONS: Record<ResourceType, string> = {
  contact: '👤',
  home: '🏠',
  vehicle: '🚗',
  account: '💳',
  inventory: '📦',
  doc: '📄',
};

interface ResourceRoomHeaderProps {
  activeType: ResourceType;
  onTypeChange: (type: ResourceType) => void;
}

export function ResourceRoomHeader({ activeType, onTypeChange }: ResourceRoomHeaderProps) {
  return (
    <div className="px-4 pt-4 pb-2 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-800 mb-2">Resources</h2>
      <div className="flex gap-1 overflow-x-auto">
        {RESOURCE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors ${
              activeType === type
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <span className="text-base">{TYPE_ICONS[type]}</span>
            <span className="text-xs capitalize">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
