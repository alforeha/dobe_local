import { useState } from 'react';
import type { Resource, ResourceType } from '../../../../../types/resource';
import { ResourceBlockExpanded } from './ResourceBlockExpanded';

interface ResourceBlockProps {
  resource: Resource;
  onEdit: (resource: Resource) => void;
}

const TYPE_BADGE: Record<ResourceType, { label: string; cls: string }> = {
  contact:   { label: 'Contact',   cls: 'bg-blue-100 text-blue-700' },
  home:      { label: 'Home',      cls: 'bg-green-100 text-green-700' },
  vehicle:   { label: 'Vehicle',   cls: 'bg-orange-100 text-orange-700' },
  account:   { label: 'Account',   cls: 'bg-emerald-100 text-emerald-700' },
  inventory: { label: 'Inventory', cls: 'bg-purple-100 text-purple-700' },
  doc:       { label: 'Doc',       cls: 'bg-gray-100 text-gray-600' },
};

export function ResourceBlock({ resource, onEdit }: ResourceBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const badge = TYPE_BADGE[resource.type];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
      >
        <span className="text-xl shrink-0">{resource.icon || '📦'}</span>
        <span className="flex-1 text-sm text-gray-800 dark:text-gray-100 truncate">{resource.name}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.cls}`}>
          {badge.label}
        </span>
        <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <ResourceBlockExpanded
          resource={resource}
          onClose={() => setExpanded(false)}
          onEdit={onEdit}
        />
      )}
    </div>
  );
}
