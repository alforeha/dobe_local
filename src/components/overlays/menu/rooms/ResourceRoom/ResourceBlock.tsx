import { useState } from 'react';
import type { Resource } from '../../../../../types/resource';
import { ResourceBlockExpanded } from './ResourceBlockExpanded';

interface ResourceBlockProps {
  resource: Resource;
}

export function ResourceBlock({ resource }: ResourceBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
      >
        <span className="text-xl shrink-0">{resource.icon || '📦'}</span>
        <span className="flex-1 text-sm text-gray-800 truncate">{resource.name}</span>
        <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <ResourceBlockExpanded
          resource={resource}
          onClose={() => setExpanded(false)}
        />
      )}
    </div>
  );
}
