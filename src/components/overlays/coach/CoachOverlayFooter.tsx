// ─────────────────────────────────────────
// CoachOverlayFooter — MVP11 W07
// Icon-only nav buttons: Recommendations, Reviewing, Tracking, Leaderboard.
// Leaderboard hidden until user reaches LEADERBOARD_LEVEL_GATE.
// Buttons reflow when Leaderboard is hidden — no empty gap.
// ─────────────────────────────────────────

import type { CoachRoom } from './CoachOverlay';

interface CoachOverlayFooterProps {
  activeRoom: CoachRoom;
  onNav: (room: CoachRoom) => void;
  userLevel: number;
}

/**
 * Level gate for the Leaderboard room.
 * BUILD-time constant — update here to change the threshold.
 */
export const LEADERBOARD_LEVEL_GATE = 5;

const ROOMS: { room: CoachRoom; icon: string; ariaLabel: string }[] = [
  { room: 'recommendations', icon: '🎯', ariaLabel: 'Recommendations' },
  { room: 'reviewing',       icon: '🔍', ariaLabel: 'Reviewing' },
  { room: 'tracking',        icon: '📍', ariaLabel: 'Tracking' },
  { room: 'leaderboard',     icon: '🏅', ariaLabel: 'Leaderboard' },
];

export function CoachOverlayFooter({ activeRoom, onNav, userLevel }: CoachOverlayFooterProps) {
  const showLeaderboard = userLevel >= LEADERBOARD_LEVEL_GATE;

  const visibleRooms = ROOMS.filter((r) => r.room !== 'leaderboard' || showLeaderboard);

  return (
    <nav className="shrink-0 flex border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      {visibleRooms.map(({ room, icon, ariaLabel }) => (
        <button
          key={room}
          type="button"
          aria-label={ariaLabel}
          aria-pressed={activeRoom === room}
          onClick={() => onNav(room)}
          className={`flex-1 flex items-center justify-center py-3 text-2xl transition-colors
            ${
              activeRoom === room
                ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          {icon}
        </button>
      ))}
    </nav>
  );
}
