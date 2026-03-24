// ─────────────────────────────────────────
// IconPicker — D93
// Compact icon picker showing all icons from ICON_MAP.
// Collapsed: shows current icon + key label + edit button.
// Expanded: 6-per-row emoji grid; tap to select and collapse.
// ─────────────────────────────────────────

import { useState } from 'react';
import { ICON_MAP } from '../../constants/iconMap';

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = useState(false);

  const normalised = value?.toLowerCase?.() ?? '';
  const displayEmoji = ICON_MAP[normalised] ?? value ?? ICON_MAP['default'];

  const entries = Object.entries(ICON_MAP);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      )}

      {/* Collapsed row */}
      <div className="flex items-center gap-2">
        <span className="text-2xl leading-none shrink-0" aria-hidden="true">
          {displayEmoji}
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1 min-w-0">
          {value || 'default'}
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close icon picker' : 'Choose icon'}
          className="shrink-0 text-xs text-gray-400 hover:text-purple-500 transition-colors px-2 py-1 rounded border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
        >
          {open ? 'Close' : '✏️'}
        </button>
      </div>

      {/* Expanded grid */}
      {open && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 mt-1">
          <div className="grid grid-cols-6 gap-1">
            {entries.map(([key, emoji]) => {
              const isSelected = normalised === key || value === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={key}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-center h-10 rounded-lg text-xl transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 ${
                    isSelected
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border border-gray-100 dark:border-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
