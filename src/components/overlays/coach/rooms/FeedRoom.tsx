import { useState } from 'react';
import { useUserStore } from '../../../../stores/useUserStore';
import { FeedMessage } from './FeedMessage';

export function FeedRoom() {
  const feed = useUserStore((s) => s.user?.feed);
  const markFeedEntryRead = useUserStore((s) => s.markFeedEntryRead);
  const markAllFeedRead = useUserStore((s) => s.markAllFeedRead);
  const toggleFeedReaction = useUserStore((s) => s.toggleFeedReaction);

  const entries = feed?.entries ?? [];
  const unreadCount = feed?.unreadCount ?? 0;

  const [hideRead, setHideRead] = useState(false);
  const [search, setSearch] = useState('');

  const indexedEntries = entries.map((entry, idx) => ({ entry, idx }));
  const filtered = indexedEntries.filter(({ entry }) => {
    if (hideRead && entry.read) return false;
    if (search && !entry.commentBlock.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Feed</h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllFeedRead}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideRead((v) => !v)}
            className={[
              'text-xs rounded-full px-3 py-1 transition-colors border',
              hideRead
                ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            ].join(' ')}
          >
            Hide read
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feed…"
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {entries.length === 0 ? 'No messages yet.' : 'No matching entries.'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map(({ entry, idx }) => (
            <FeedMessage
              key={idx}
              entry={entry}
              entryIndex={idx}
              onMarkRead={markFeedEntryRead}
              onToggleReaction={toggleFeedReaction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
