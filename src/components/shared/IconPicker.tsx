import { useEffect, useRef, useState } from 'react';
import { ICON_MAP, resolveIcon } from '../../constants/iconMap';

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
  label?: string;
  align?: 'left' | 'center' | 'right';
}

export function IconPicker({ value, onChange, label, align = 'center' }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const normalised = value?.toLowerCase?.() ?? '';
  const displayEmoji = resolveIcon(value);
  const entries = Object.entries(ICON_MAP);
  const popoverClassName = align === 'left'
    ? 'absolute left-0 top-full z-20 mt-2 min-w-[18rem] rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800'
    : align === 'right'
      ? 'absolute right-0 top-full z-20 mt-2 min-w-[18rem] rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800'
      : 'absolute left-1/2 top-full z-20 mt-2 min-w-[18rem] -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-600 dark:bg-gray-800';

  return (
    <div ref={rootRef} className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      )}

      <div className="relative flex flex-col items-center">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? 'Close icon picker' : 'Choose icon'}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-2xl shadow-sm transition-colors hover:border-purple-400 dark:border-gray-600 dark:bg-gray-800"
        >
          <span aria-hidden="true">{displayEmoji}</span>
        </button>

        {open && (
          <div className={popoverClassName}>
            <div className="grid grid-cols-6 gap-1.5">
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
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 ${
                      isSelected
                        ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700'
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
    </div>
  );
}
