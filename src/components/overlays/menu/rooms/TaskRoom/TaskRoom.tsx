import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { TaskRoomHeader } from './TaskRoomHeader';
import { TaskRoomBody } from './TaskRoomBody';

type TaskTab = 'stat' | 'resource';

export function TaskRoom() {
  const [tab, setTab] = useState<TaskTab>('stat');
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const entries = Object.entries(taskTemplates);
  // BUILD-TIME: resource task detection deferred — show all in stat tab, none in resource tab
  const filtered = tab === 'stat' ? entries : [];

  return (
    <div className="flex flex-col h-full">
      <TaskRoomHeader activeTab={tab} onTabChange={setTab} />
      <TaskRoomBody templates={filtered} />
    </div>
  );
}
