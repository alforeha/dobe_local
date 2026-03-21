import { BadgeBoardCanvas } from './BadgeBoardCanvas';
import { EarnedBadgesTray } from './EarnedBadgesTray';

export function BadgeRoom() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700">Badges</h3>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Awaiting placement
          </p>
          <EarnedBadgesTray />
        </div>
        <div className="flex flex-1 flex-col">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Board
          </p>
          <BadgeBoardCanvas />
        </div>
      </div>
    </div>
  );
}
