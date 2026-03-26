import { useState } from 'react';
import { MenuOverlayNav } from './MenuOverlayNav';
import { MenuOverlayContent } from './MenuOverlayContent';
import { autoCheckQuestItem } from '../../../engine/resourceEngine';
import { STARTER_TEMPLATE_IDS } from '../../../coach/StarterQuestLibrary';

type MenuRoom = 'world' | 'goal' | 'task' | 'schedule' | 'resource' | 'quickaction';

interface MenuOverlayProps {
  onClose: () => void;
}

export function MenuOverlay({ onClose }: MenuOverlayProps) {
  const [activeRoom, setActiveRoom] = useState<MenuRoom>('quickaction');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const handleNavigate = (room: MenuRoom) => {
    if (room === 'goal') {
      autoCheckQuestItem(STARTER_TEMPLATE_IDS.claimIdentity, 'open_adventures');
    } else if (room === 'task') {
      autoCheckQuestItem(STARTER_TEMPLATE_IDS.learnGrounds, 'open_task_room');
    } else if (room === 'schedule') {
      autoCheckQuestItem(STARTER_TEMPLATE_IDS.learnGrounds, 'open_schedule');
    } else if (room === 'resource') {
      autoCheckQuestItem(STARTER_TEMPLATE_IDS.learnGrounds, 'open_resources');
    }
    setActiveRoom(room);
    setNavCollapsed(true);
  };

  return (
    <div className="flex h-full">
      <MenuOverlayContent activeRoom={activeRoom} />
      <MenuOverlayNav
        activeRoom={activeRoom}
        onNavigate={handleNavigate}
        onClose={onClose}
        collapsed={navCollapsed}
        onToggleCollapse={() => setNavCollapsed((c) => !c)}
      />
    </div>
  );
}
