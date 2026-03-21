// ─────────────────────────────────────────
// CoachOverlayHeader — MVP11 W07
// Large coach icon (focal point, left), conditional bee feed button, close button.
// Header background matches overlay — no strong contrast.
// ─────────────────────────────────────────

interface CoachOverlayHeaderProps {
  onClose: () => void;
  onFeedNav: () => void;
  onInfo?: () => void;
  unreadCount: number;
}

export function CoachOverlayHeader({ onClose, onFeedNav, onInfo, unreadCount }: CoachOverlayHeaderProps) {
  return (
    <div className="flex shrink-0 items-center px-4 py-5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* Coach icon + bee offset badge — bee always visible, pulses when unread */}
      <div className="relative">
        <div className="text-7xl leading-none select-none" aria-hidden="true">🐸</div>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `${unreadCount} unread feed messages` : 'Feed'}
          onClick={onFeedNav}
          className="absolute -top-2 -right-14 text-3xl leading-none hover:opacity-70 transition-opacity"
        >
          🐝
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          )}
        </button>
      </div>

      {/* Flex spacer */}
      <div className="flex-1" />

      {/* Right: info + gap + close */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          aria-label="About coach"
          onClick={onInfo}
          className="text-4xl leading-none text-gray-400 hover:opacity-70 transition-opacity"
        >
          ℹ️
        </button>
        <button
          type="button"
          aria-label="Close coach"
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
