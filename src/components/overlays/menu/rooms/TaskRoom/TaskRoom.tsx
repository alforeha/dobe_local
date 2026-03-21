import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { taskTemplateLibrary } from '../../../../../coach';
import { TaskRoomHeader } from './TaskRoomHeader';
import { TaskRoomBody } from './TaskRoomBody';
import type { TaskTemplate } from '../../../../../types';

type TaskTab = 'stat' | 'resource';

export function TaskRoom() {
  const [tab, setTab] = useState<TaskTab>('stat');
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const prebuiltEntries = taskTemplateLibrary.map((t): [string, TaskTemplate] => [t.id ?? t.name, t]);
  const userEntries = Object.entries(taskTemplates);
  // Prebuilt templates shown first in Stat Tasks tab; resource tab deferred (BUILD-TIME)
  const filtered: [string, TaskTemplate][] = tab === 'stat' ? [...prebuiltEntries, ...userEntries] : [];

  return (
    <div className="flex flex-col h-full">
      <TaskRoomHeader activeTab={tab} onTabChange={setTab} />
      <TaskRoomBody templates={filtered} />
    </div>
  );
}
