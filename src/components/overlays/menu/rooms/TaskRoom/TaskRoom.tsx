import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { taskTemplateLibrary } from '../../../../../coach';
import { TaskRoomHeader } from './TaskRoomHeader';
import { TaskRoomBody } from './TaskRoomBody';
import { TaskTemplatePopup } from './TaskTemplatePopup';
import type { TaskTemplate } from '../../../../../types';

type TaskTab = 'stat' | 'resource';

type PopupState =
  | { mode: 'add' }
  | { mode: 'edit'; key: string; template: TaskTemplate }
  | null;

export function TaskRoom() {
  const [tab, setTab] = useState<TaskTab>('stat');
  const [popup, setPopup] = useState<PopupState>(null);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const prebuiltEntries = taskTemplateLibrary.map(
    (t): [string, TaskTemplate, boolean] => [t.id ?? t.name, t, false],
  );
  const prebuiltIds = new Set(prebuiltEntries.map(([k]) => k));
  const userEntries = Object.entries(taskTemplates)
    .filter(([k]) => !prebuiltIds.has(k))
    .map(([k, t]): [string, TaskTemplate, boolean] => [k, t, true]);
  // Prebuilt templates shown first in Stat Tasks tab; resource tab deferred (BUILD-TIME)
  const filtered: [string, TaskTemplate, boolean][] =
    tab === 'stat' ? [...prebuiltEntries, ...userEntries] : [];

  function handleEdit(key: string, template: TaskTemplate) {
    setPopup({ mode: 'edit', key, template });
  }

  return (
    <div className="flex flex-col h-full">
      <TaskRoomHeader activeTab={tab} onTabChange={setTab} onAdd={() => setPopup({ mode: 'add' })} />
      <TaskRoomBody templates={filtered} onEdit={handleEdit} />
      {popup && (
        <TaskTemplatePopup
          editKey={popup.mode === 'edit' ? popup.key : null}
          editTemplate={popup.mode === 'edit' ? popup.template : null}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
