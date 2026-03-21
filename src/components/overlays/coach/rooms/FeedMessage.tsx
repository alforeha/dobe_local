import type { FeedEntry } from '../../../../types';

interface FeedMessageProps {
  entry: FeedEntry;
}

/** Individual feed message. React action + auto-delete schedule is BUILD-time. */
export function FeedMessage({ entry }: FeedMessageProps) {
  return (
    <div className="px-4 py-3">
      <p className="text-sm text-gray-800">{entry.commentBlock}</p>
      <p className="mt-1 text-xs text-gray-400">{entry.sourceType} · {entry.timestamp}</p>
      {/* React action — BUILD-time interaction */}
      <button type="button" className="mt-1 text-xs text-purple-500 hover:underline">React</button>
    </div>
  );
}
