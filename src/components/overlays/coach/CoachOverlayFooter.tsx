import type { CoachRoom } from './CoachOverlay';

interface CoachOverlayFooterProps {
  activeRoom: CoachRoom;
  onNav: (room: CoachRoom) => void;
}

/**
 * Nav buttons per room. Leaderboard hidden until level gate.
 * Level gate threshold: 10 — BUILD-time placeholder, replace with config value.
 */
const LEADERBOARD_LEVEL_GATE = 10; // BUILD-time placeholder

const ROOMS: { room: CoachRoom; label: string }[] = [
  { room: 'feed', label: 'Feed' },
  { room: 'recommendations', label: 'Recs' },
  { room: 'reviewing', label: 'Review' },
  { room: 'tracking', label: 'Track' },
  { room: 'leaderboard', label: '🏆' },
];

interface CoachOverlayFooterPropsExtended extends CoachOverlayFooterProps {
  userLevel?: number;
}

export function CoachOverlayFooter({ activeRoom, onNav, userLevel = 0 }: CoachOverlayFooterPropsExtended) {
  const showLeaderboard = userLevel >= LEADERBOARD_LEVEL_GATE;

  const visibleRooms = ROOMS.filter((r) => r.room !== 'leaderboard' || showLeaderboard);

  return (
    <nav className="shrink-0 flex border-t border-gray-200 bg-white">
      {visibleRooms.map(({ room, label }) => (
        <button
          key={room}
          type="button"
          onClick={() => onNav(room)}
          className={`flex-1 py-3 text-xs font-medium transition-colors
            ${activeRoom === room ? 'text-purple-600 border-t-2 border-purple-600' : 'text-gray-500 hover:text-gray-800'}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
