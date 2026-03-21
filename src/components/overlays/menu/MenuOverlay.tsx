import { useState } from 'react';
import { MenuOverlayNav } from './MenuOverlayNav';
import { MenuOverlayContent } from './MenuOverlayContent';

type MenuRoom = 'world' | 'goal' | 'task' | 'schedule' | 'resource' | 'quickaction';

interface MenuOverlayProps {
  onClose: () => void;
}

export function MenuOverlay({ onClose }: MenuOverlayProps) {
  const [activeRoom, setActiveRoom] = useState<MenuRoom>('quickaction');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavigate = (room: MenuRoom) => {
    setActiveRoom(room);
    setNavCollapsed(true);
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <MenuOverlayNav
        activeRoom={activeRoom}
        onNavigate={handleNavigate}
        onClose={onClose}
        collapsed={navCollapsed}
        onToggleCollapse={() => setNavCollapsed((c) => !c)}
      />
      <MenuOverlayContent activeRoom={activeRoom} />
    </div>
  );
}
