import { useUserStore } from '../../../../stores/useUserStore';
import { FeedMessage } from './FeedMessage';

export function FeedRoom() {
  const feed = useUserStore((s) => s.user?.feed);
  const entries = feed?.entries ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-2">
        <h3 className="text-sm font-bold text-gray-700">Feed</h3>
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-400">No messages yet.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {entries.map((entry, i) => (
            <FeedMessage key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
