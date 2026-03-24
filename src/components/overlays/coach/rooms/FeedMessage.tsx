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
  onSetReaction: (index: number, reaction: string) => void;
}

export function FeedMessage({ entry, entryIndex, onMarkRead, onSetReaction }: FeedMessageProps) {
  const isRead = entry.read === true;
  const activeReaction = entry.reaction;

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
      <div className="flex gap-2 px-3 py-3">
        {/* LEFT: source icon + message */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-base leading-none select-none" aria-hidden="true">
            {getFeedSourceIcon(entry.sourceType)}
          </span>
          <p className="text-sm text-gray-900 dark:text-gray-100 leading-snug">
            {entry.commentBlock}
          </p>
        </div>

        {/* RIGHT: timestamp / reactions / read — tight stack */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 leading-none mb-1">
            {formatTimestamp(entry.timestamp)}
          </span>
          <div className="flex gap-0.5">
            {REACTIONS.map(({ emoji, key }) => (
              <button
                key={key}
                type="button"
                aria-label={key}
                onClick={() => onSetReaction(entryIndex, key)}
                className={[
                  'text-base leading-none rounded-full w-7 h-7 flex items-center justify-center transition-colors',
                  activeReaction === key
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
              'text-xs rounded-lg px-2 py-0.5 mt-1 transition-colors',
              isRead
                ? 'text-gray-400 dark:text-gray-500 cursor-default'
                : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50',
            ].join(' ')}
          >
            {isRead ? '\u2713 Read' : 'Read'}
          </button>
        </div>
      </div>
    </div>
  );
}
