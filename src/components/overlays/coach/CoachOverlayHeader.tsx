interface CoachOverlayHeaderProps {
  onClose: () => void;
  onFeedNav: () => void;
  unreadCount: number;
}

export function CoachOverlayHeader({ onClose, onFeedNav, unreadCount }: CoachOverlayHeaderProps) {
  return (
    <div className="flex shrink-0 items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3">
      {/* Info button */}
      <button type="button" aria-label="About coach" className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
        ℹ
      </button>

      {/* Coach avatar — centred */}
      <div className="flex flex-1 flex-col items-center">
        <div className="text-3xl">🐸</div>
        {/* Coach callout bubble — BUILD-time decision, omitted per spec */}
      </div>

      {/* Feed notification + close */}
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <button
            type="button"
            aria-label={`${unreadCount} unread messages`}
            onClick={onFeedNav}
            className="relative rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-200"
          >
            {unreadCount}
          </button>
        )}
        <button
          type="button"
          aria-label="Close coach"
          onClick={onClose}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
