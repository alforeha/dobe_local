import { useState } from 'react';
import type { TaskTemplate } from '../../../../../../types';

interface FavouriteTaskBlockProps {
  templateKey: string;
  template: TaskTemplate;
}

export function FavouriteTaskBlock({ templateKey: _templateKey, template }: FavouriteTaskBlockProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <span className="text-base shrink-0">{template.icon || '⭐'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">{template.name}</p>
        <p className="text-xs text-gray-400">{template.taskType}</p>
      </div>
      {confirming ? (
        <div className="flex gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-gray-400 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-xs text-white px-1.5 py-0.5 rounded bg-green-500"
          >
            ✓
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-xs text-blue-500 shrink-0 font-medium"
        >
          Execute
        </button>
      )}
    </div>
  );
}
