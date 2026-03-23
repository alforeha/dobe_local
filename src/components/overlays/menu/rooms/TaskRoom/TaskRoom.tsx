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

  // Only show templates the user has activated (in store).
  // Prebuilt IDs (from coach bundle) are read-only; UUID keys are user-custom.
  const prebuiltIds = new Set(taskTemplateLibrary.map((t) => t.id ?? t.name));
  const filtered: [string, TaskTemplate, boolean][] =
    tab === 'stat'
      ? Object.entries(taskTemplates).map(
          ([k, t]): [string, TaskTemplate, boolean] => [k, t, !prebuiltIds.has(k)],
        )
      : [];

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
