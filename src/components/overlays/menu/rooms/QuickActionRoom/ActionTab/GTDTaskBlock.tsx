import { useState } from 'react';
import type { Task } from '../../../../../../types';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { completeGTDItem } from '../../../../../../engine/resourceEngine';

interface GTDTaskBlockProps {
  task: Task;
  templateName: string;
}

export function GTDTaskBlock({ task, templateName }: GTDTaskBlockProps) {
  const user = useUserStore((s) => s.user);
  const [confirming, setConfirming] = useState(false);

  function handleConfirmComplete() {
    if (!user) return;
    completeGTDItem(task.id, user);
    setConfirming(false);
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          task.completionState === 'complete' ? 'bg-green-400' : 'bg-gray-300'
        }`}
      />
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">{templateName}</span>
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
            onClick={handleConfirmComplete}
            className="text-xs text-white px-1.5 py-0.5 rounded bg-green-500 hover:bg-green-600"
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
