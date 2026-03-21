import type { ReactNode } from 'react';

interface PopupShellProps {
  title: string;
  onClose: () => void;
  children?: ReactNode;
}

/** Shared wrapper for all ADD/EDIT popups — internal layout is BUILD-time per popup */
export function PopupShell({ title, onClose, children }: PopupShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
        {/* Content — BUILD-time per popup */}
        <div className="p-4">
          {children ?? (
            <p className="text-sm text-gray-400 italic">Popup content — BUILD-time</p>
          )}
        </div>
      </div>
    </div>
  );
}
