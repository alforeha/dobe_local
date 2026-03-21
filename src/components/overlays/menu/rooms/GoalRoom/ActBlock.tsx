import { useState } from 'react';
import type { Act } from '../../../../../types';
import { ActBlockExpanded } from './ActBlockExpanded';

interface ActBlockProps {
  act: Act;
  onEdit: (act: Act) => void;
}

export function ActBlock({ act, onEdit }: ActBlockProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 flex items-center gap-3 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-xl shrink-0">{act.icon || '🎯'}</span>
          <span className="flex-1 text-sm font-medium text-gray-800 truncate">{act.name}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
              act.completionState === 'complete'
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {act.completionState}
          </span>
          <span className="text-gray-400 text-xs shrink-0">{expanded ? '▲' : '▼'}</span>
        </button>
        <button
          type="button"
          aria-label="Edit Act"
          onClick={() => onEdit(act)}
          className="shrink-0 text-xs text-gray-400 hover:text-blue-500 transition-colors px-1"
        >
          ✏️
        </button>
      </div>
      {expanded && <ActBlockExpanded act={act} />}
    </div>
  );
}
