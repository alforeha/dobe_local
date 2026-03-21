import type { Resource } from '../../../../../types/resource';

interface ResourceBlockExpandedProps {
  resource: Resource;
  onClose: () => void;
}

export function ResourceBlockExpanded({ resource, onClose }: ResourceBlockExpandedProps) {
  return (
    <div className="px-3 pb-3">
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl shrink-0">{resource.icon || '📦'}</span>
          <span className="flex-1 text-sm font-medium text-gray-800 truncate">
            {resource.name}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 text-sm leading-none shrink-0"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1 mb-2">
          ⚠️ BUILD-TIME STUB — {resource.type} meta display coming
        </p>
        {resource.description && (
          <p className="text-xs text-gray-500 mb-2">{resource.description}</p>
        )}
        <button type="button" className="text-xs text-blue-500 font-medium">
          Edit
        </button>
      </div>
    </div>
  );
}
