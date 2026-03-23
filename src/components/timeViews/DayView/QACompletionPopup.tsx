import { useScheduleStore } from '../../../stores/useScheduleStore';
import { resolveTemplate } from './qaUtils';
import { PopupShell } from '../../shared/popups/PopupShell';
import type { QuickActionsCompletion, RollInputFields } from '../../../types';

interface QACompletionPopupProps {
  completion: QuickActionsCompletion;
  onClose: () => void;
}

/** Format an ISO datetime string to HH:MM local time */
function formatHHMM(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Extract up to 3 readable key:value pairs from resultFields, excluding null/undefined/empty */
function resultSummaryPairs(resultFields: Record<string, unknown>): Array<[string, string]> {
  return Object.entries(resultFields)
    .filter(([, v]) => v !== null && v !== undefined && v !== '' && !Array.isArray(v))
    .slice(0, 3)
    .map(([k, v]) => [k, String(v)]);
}

export function QACompletionPopup({ completion, onClose }: QACompletionPopupProps) {
  const { tasks, taskTemplates } = useScheduleStore((s) => ({
    tasks: s.tasks,
    taskTemplates: s.taskTemplates,
  }));

  const task = tasks[completion.taskRef];
  const template = task ? resolveTemplate(task.templateRef, taskTemplates) : null;
  const taskName = template?.name ?? (task?.templateRef ?? '—');
  const isRoll = template?.taskType === 'ROLL';

  const rollFields = isRoll && task
    ? (task.resultFields as unknown as RollInputFields)
    : null;

  const summaryPairs =
    !isRoll && task
      ? resultSummaryPairs(task.resultFields as Record<string, unknown>)
      : [];

  return (
    <PopupShell title={taskName} onClose={onClose}>
      <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
        {/* Completed time */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Completed at</span>
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {formatHHMM(completion.completedAt)}
          </span>
        </div>

        {/* ROLL — dice result display */}
        {isRoll && (
          <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎲</span>
              <span className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {rollFields?.result ?? '—'}
              </span>
            </div>
            {rollFields?.boostApplied && (
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Multiplier:{' '}
                <span className="font-semibold">{rollFields.boostApplied}</span>
              </div>
            )}
          </div>
        )}

        {/* Other types — resultFields summary */}
        {!isRoll && summaryPairs.length > 0 && (
          <div className="space-y-1 rounded bg-gray-50 dark:bg-gray-700/40 p-2">
            {summaryPairs.map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="capitalize text-gray-500 dark:text-gray-400">{key}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Read-only notice */}
        <p className="text-xs text-gray-400 italic">Read-only — editing not available in LOCAL v1</p>
      </div>
    </PopupShell>
  );
}
