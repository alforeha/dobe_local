import { useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { CoachOverlayHeader } from './CoachOverlayHeader';
import { CoachOverlayFooter } from './CoachOverlayFooter';
import { FeedRoom } from './rooms/FeedRoom';
import { RecommendationsRoom } from './rooms/RecommendationsRoom';
import { ReviewingRoom } from './rooms/ReviewingRoom';
import { TrackingRoom } from './rooms/TrackingRoom';
import { LeaderboardRoom } from './rooms/LeaderboardRoom';

export type CoachRoom = 'feed' | 'recommendations' | 'reviewing' | 'tracking' | 'leaderboard';

interface CoachOverlayProps {
  onClose: () => void;
  onOpenEvent?: (eventId: string) => void;
  onNavigateToDayView?: (date: string) => void;
}

export function CoachOverlay({ onClose, onOpenEvent, onNavigateToDayView }: CoachOverlayProps) {
  // Select stable primitives to avoid new-reference churn from array selectors
  const unreadCount = useUserStore(
    (s) => s.user?.feed.entries.filter((e) => !e.read).length ?? 0,
  );
  const hasFeedContent = useUserStore(
    (s) => (s.user?.feed.entries.length ?? 0) > 0,
  );
  const userLevel = useUserStore((s) => s.user?.progression.stats.level ?? 0);

  const [activeRoom, setActiveRoom] = useState<CoachRoom>(
    hasFeedContent ? 'feed' : 'recommendations'
  );

  const handleOpenEvent = (eventId: string) => {
    onClose();
    onOpenEvent?.(eventId);
  };

  const handleNavigateToDayView = (date: string) => {
    onClose();
    onNavigateToDayView?.(date);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <CoachOverlayHeader
        onClose={onClose}
        onFeedNav={() => setActiveRoom('feed')}
        unreadCount={unreadCount}
      />

      {/* Room content */}
      <div className="flex-1 overflow-hidden">
        {activeRoom === 'feed' && <FeedRoom />}
        {activeRoom === 'recommendations' && <RecommendationsRoom />}
        {activeRoom === 'reviewing' && (
          <ReviewingRoom
            onNavigateToDayView={handleNavigateToDayView}
            onOpenEvent={handleOpenEvent}
          />
        )}
        {activeRoom === 'tracking' && <TrackingRoom onOpenEvent={handleOpenEvent} />}
        {activeRoom === 'leaderboard' && <LeaderboardRoom />}
      </div>

      <CoachOverlayFooter
        activeRoom={activeRoom}
        onNav={setActiveRoom}
        userLevel={userLevel}
      />
    </div>
  );
}
