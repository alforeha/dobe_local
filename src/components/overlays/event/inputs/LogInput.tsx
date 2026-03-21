import { useState } from 'react';
import type { LogInputFields } from '../../../../types/taskTemplate';
import type { Task } from '../../../../types/task';

interface LogInputProps {
  inputFields: LogInputFields;
  task: Task;
  onComplete: (result: Partial<LogInputFields>) => void;
}

export function LogInput({ inputFields, task, onComplete }: LogInputProps) {
  const isComplete = task.completionState === 'complete';
  const { prompt, unit } = inputFields;
  const [value, setValue] = useState('');
  const [amount, setAmount] = useState('');

  if (isComplete) {
    const saved = task.resultFields as Partial<LogInputFields>;
    return (
      <div className="space-y-1 py-2">
        <span className="text-sm font-medium text-green-600 dark:text-green-400">✓ Logged</span>
        {saved.value && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-2">{saved.value}</p>
        )}
      </div>
    );
  }

  const handleSave = () => {
    if (!value.trim()) return;
    onComplete({
      prompt: prompt ?? null,
      value: value.trim(),
      resourceRef: inputFields.resourceRef ?? null,
      amount: amount !== '' ? Number(amount) : null,
      unit: unit ?? null,
    });
  };

  return (
    <div className="space-y-2 py-1">
      {prompt && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{prompt}</p>
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Log entry…"
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-purple-500 focus:outline-none"
      />

      {unit !== undefined && unit !== null && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:border-purple-500 focus:outline-none"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>
        </div>
      )}

      <button
        type="button"
        disabled={!value.trim()}
        onClick={handleSave}
        className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-40 transition-colors"
      >
        Save Log
      </button>
    </div>
  );
}
