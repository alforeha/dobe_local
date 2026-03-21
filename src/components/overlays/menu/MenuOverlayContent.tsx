import { WorldRoom } from './rooms/WorldRoom';
import { GoalRoom } from './rooms/GoalRoom/GoalRoom';
import { TaskRoom } from './rooms/TaskRoom/TaskRoom';
import { ScheduleRoom } from './rooms/ScheduleRoom/ScheduleRoom';
import { ResourceRoom } from './rooms/ResourceRoom/ResourceRoom';
import { QuickActionRoom } from './rooms/QuickActionRoom/QuickActionRoom';

type MenuRoom = 'world' | 'goal' | 'task' | 'schedule' | 'resource' | 'quickaction';

interface MenuOverlayContentProps {
  activeRoom: MenuRoom;
}

export function MenuOverlayContent({ activeRoom }: MenuOverlayContentProps) {
  return (
    <div className="flex-1 overflow-hidden bg-white">
      {activeRoom === 'world' && <WorldRoom />}
      {activeRoom === 'goal' && <GoalRoom />}
      {activeRoom === 'task' && <TaskRoom />}
      {activeRoom === 'schedule' && <ScheduleRoom />}
      {activeRoom === 'resource' && <ResourceRoom />}
      {activeRoom === 'quickaction' && <QuickActionRoom />}
    </div>
  );
}
