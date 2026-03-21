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
  const feed = useUserStore((s) => s.user?.feed);
  const hasFeedContent = (feed?.entries?.length ?? 0) > 0;

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
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      <CoachOverlayHeader
        onClose={onClose}
        onFeedNav={() => setActiveRoom('feed')}
        unreadCount={feed?.unreadCount ?? 0}
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

      <CoachOverlayFooter activeRoom={activeRoom} onNav={setActiveRoom} />
    </div>
  );
}
