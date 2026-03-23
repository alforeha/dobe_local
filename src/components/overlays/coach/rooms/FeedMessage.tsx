import type { FeedEntry } from '../../../../types';
import { getFeedSourceIcon } from './feedConstants';
import { localISODate } from '../../../../utils/dateUtils';

const REACTIONS: { emoji: string; key: string }[] = [
  { emoji: '\uD83D\uDC4D', key: 'agree' },
  { emoji: '\uD83D\uDCAA', key: 'motivated' },
  { emoji: '\uD83D\uDC38', key: 'ribbit' },
  { emoji: '\u2B50', key: 'save' },
];

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const today = localISODate(new Date());
  const entryDate = iso.slice(0, 10);
  if (entryDate === today) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface FeedMessageProps {
  entry: FeedEntry;
  entryIndex: number;
  onMarkRead: (index: number) => void;
  onToggleReaction: (index: number, reaction: string) => void;
}

export function FeedMessage({ entry, entryIndex, onMarkRead, onToggleReaction }: FeedMessageProps) {
  const isRead = entry.read === true;
  const reactions = entry.reactions ?? [];

  return (
    <div
      className={[
        'rounded-xl border mx-3 my-2 overflow-hidden',
        'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        !isRead ? 'border-l-4 border-l-emerald-500' : '',
        isRead ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* TOP ROW: icon + timestamp */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-1">
        <span className="text-base leading-none select-none" aria-hidden="true">
          {getFeedSourceIcon(entry.sourceType)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {formatTimestamp(entry.timestamp)}
        </span>
      </div>

      {/* BODY */}
      <div className="px-3 py-2">
        <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
          {entry.commentBlock}
        </p>
      </div>

      {/* BOTTOM ROW: reactions + read button */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex gap-1">
          {REACTIONS.map(({ emoji, key }) => (
            <button
              key={key}
              type="button"
              aria-label={key}
              onClick={() => onToggleReaction(entryIndex, key)}
              className={[
                'text-base leading-none rounded-full w-8 h-8 flex items-center justify-center transition-colors',
                reactions.includes(key)
                  ? 'bg-emerald-100 dark:bg-emerald-900/40'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
              ].join(' ')}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { if (!isRead) onMarkRead(entryIndex); }}
          className={[
            'text-xs rounded-lg px-3 py-1 transition-colors',
            isRead
              ? 'text-gray-400 dark:text-gray-500 cursor-default'
              : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
          ].join(' ')}
        >
          {isRead ? '\u2713 Read' : 'Read'}
        </button>
      </div>
    </div>
  );
}
