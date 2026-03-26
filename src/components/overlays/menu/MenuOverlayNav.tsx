import { GlowRing } from '../../shared/GlowRing';
import { ONBOARDING_GLOW } from '../../../constants/onboardingKeys';
import { useGlows } from '../../../hooks/useOnboardingGlow';

type MenuRoom = 'world' | 'goal' | 'task' | 'schedule' | 'resource' | 'quickaction';

const NAV_ITEMS: { room: MenuRoom; label: string; icon: string }[] = [
  { room: 'world', label: 'World', icon: '🌍' },
  { room: 'goal', label: 'Goals', icon: '🎯' },
  { room: 'task', label: 'Tasks', icon: '✅' },
  { room: 'schedule', label: 'Schedule', icon: '📅' },
  { room: 'resource', label: 'Resource', icon: '📦' },
  { room: 'quickaction', label: 'Quick Action', icon: '⚡' },
];

interface MenuOverlayNavProps {
  activeRoom: MenuRoom;
  onNavigate: (room: MenuRoom) => void;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function MenuOverlayNav({
  activeRoom,
  onNavigate,
  onClose,
  collapsed,
  onToggleCollapse,
}: MenuOverlayNavProps) {
  const goalRoomGlows = useGlows(ONBOARDING_GLOW.ADVENTURES_TAB);
  const taskRoomGlows = useGlows(ONBOARDING_GLOW.TASK_ROOM_NAV);
  const scheduleRoomGlows = useGlows(ONBOARDING_GLOW.SCHEDULE_ROOM_NAV);
  const resourceRoomGlows = useGlows(ONBOARDING_GLOW.RESOURCES_ROOM_NAV);

  return (
    <div
      className={`flex flex-col bg-gray-900 transition-all duration-200 shrink-0 ${
        collapsed ? 'w-14' : 'w-44'
      }`}
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex items-center justify-center h-12 text-gray-400 hover:text-white border-b border-gray-700 shrink-0"
        aria-label={collapsed ? 'Expand nav' : 'Collapse nav'}
      >
        <span className="text-sm">{collapsed ? '▶' : '◀'}</span>
      </button>

      <div className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ room, label, icon }) => (
          <GlowRing
            key={room}
            active={
              (room === 'goal' && goalRoomGlows) ||
              (room === 'task' && taskRoomGlows) ||
              (room === 'schedule' && scheduleRoomGlows) ||
              (room === 'resource' && resourceRoomGlows)
            }
            rounded="lg"
            className="block"
          >
            <button
              type="button"
              onClick={() => onNavigate(room)}
              className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-800 transition-colors ${
                activeRoom === room ? 'bg-gray-800 text-white' : 'text-gray-400'
              }`}
            >
              <span className="text-lg shrink-0">{icon}</span>
              {!collapsed && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          </GlowRing>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-3 border-t border-gray-700 text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors shrink-0"
      >
        <span className="text-lg shrink-0">🚪</span>
        {!collapsed && <span className="text-sm">Exit Menu</span>}
      </button>
    </div>
  );
}
