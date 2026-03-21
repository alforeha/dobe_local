// ─────────────────────────────────────────
// TypeSelectorSheet — first step of the Add Resource flow.
// Shows all 6 resource types. Only 'contact' is enabled in W22;
// the rest are greyed out with a "Coming soon" label until W23–W27.
// ─────────────────────────────────────────

import type { ResourceType } from '../../../../../types/resource';

interface TypeOption {
  type: ResourceType;
  icon: string;
  label: string;
  available: boolean;
}

const TYPES: TypeOption[] = [
  { type: 'contact',   icon: '👤', label: 'Contact',   available: true  },
  { type: 'home',      icon: '🏠', label: 'Home',      available: false },
  { type: 'vehicle',   icon: '🚗', label: 'Vehicle',   available: false },
  { type: 'account',   icon: '💳', label: 'Account',   available: false },
  { type: 'inventory', icon: '📦', label: 'Inventory', available: false },
  { type: 'doc',       icon: '📄', label: 'Doc',       available: false },
];

interface TypeSelectorSheetProps {
  onSelect: (type: ResourceType) => void;
  onCancel: () => void;
}

export function TypeSelectorSheet({ onSelect, onCancel }: TypeSelectorSheetProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          ← Back
        </button>
        <h3 className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
          Add Resource
        </h3>
      </div>

      {/* Type list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs text-gray-400 mb-3">What type of resource?</p>
        <div className="space-y-2">
          {TYPES.map(({ type, icon, label, available }) => (
            <button
              key={type}
              type="button"
              disabled={!available}
              onClick={() => onSelect(type)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                available
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                {label}
              </span>
              {available ? (
                <span className="text-gray-300 text-xs">▶</span>
              ) : (
                <span className="text-xs text-gray-400">Soon</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
