import { useState } from 'react';
import { PopupShell } from '../../shared/popups/PopupShell';
import type { Event } from '../../../types';

interface ActionBarProps {
  event: Event;
  playMode: boolean;
  onTogglePlay: () => void;
  taskCount: number;
  completedCount: number;
}

type PopupType = 'attachment' | 'link' | 'location' | null;

export function ActionBar({ event: _event, playMode, onTogglePlay, taskCount, completedCount }: ActionBarProps) {
  const [openPopup, setOpenPopup] = useState<PopupType>(null);

  return (
    <>
      <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
        {/* Play button — toggles auto-advance mode (UI-11). Auto-advance logic is BUILD-time. */}
        <button
          type="button"
          aria-label={playMode ? 'Pause' : 'Play'}
          onClick={onTogglePlay}
          className={`rounded-full p-1.5 text-sm transition-colors ${playMode ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        >
          {playMode ? '⏸' : '▶'}
        </button>

        {/* Attachment */}
        <button
          type="button"
          aria-label="Attachments"
          onClick={() => setOpenPopup('attachment')}
          className="rounded-full p-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          📎
        </button>

        {/* Link */}
        <button
          type="button"
          aria-label="Link resource"
          onClick={() => setOpenPopup('link')}
          className="rounded-full p-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          🔗
        </button>

        {/* Shared — stub, inactive in LOCAL */}
        <button
          type="button"
          aria-label="Share (unavailable in LOCAL)"
          disabled
          className="rounded-full p-1.5 text-sm bg-gray-50 dark:bg-gray-800 text-gray-300 cursor-not-allowed"
        >
          👥
        </button>

        {/* Location */}
        <button
          type="button"
          aria-label="Location"
          onClick={() => setOpenPopup('location')}
          className="rounded-full p-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          📍
        </button>

        {/* Completion count */}
        <span className="ml-auto text-xs font-semibold text-gray-600">
          {completedCount}/{taskCount}
        </span>
      </div>

      {/* Popup shells — BUILD-time internal layouts */}
      {openPopup === 'attachment' && (
        <PopupShell title="Attachments" onClose={() => setOpenPopup(null)} />
      )}
      {openPopup === 'link' && (
        <PopupShell title="Link Resource" onClose={() => setOpenPopup(null)} />
      )}
      {openPopup === 'location' && (
        <PopupShell title="Location" onClose={() => setOpenPopup(null)} />
      )}
    </>
  );
}
