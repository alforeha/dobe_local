import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { TaskRoomHeader } from './TaskRoomHeader';
import { TaskRoomBody } from './TaskRoomBody';
import { TaskTemplatePopup } from './TaskTemplatePopup';
import type { TaskTemplate } from '../../../../../types';

type TaskTab = 'stat' | 'resource';

type PopupState =
  | { mode: 'add' }
  | { mode: 'edit'; key: string; template: TaskTemplate }
  | null;

// Onboarding quest tasks — seeded for the quest engine, not user-facing.
const SYSTEM_TASK_IDS = new Set([
  'tmpl-open-welcome-0000-0000-0000-0001',
  'tmpl-setup-schedule-000-0000-0000-01',
  'tmpl-learn-grounds-000-0000-0000-0001',
  'tmpl-claim-identity-00-0000-0000-0001',
]);

export function TaskRoom() {
  const [tab, setTab] = useState<TaskTab>('stat');
  const [popup, setPopup] = useState<PopupState>(null);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  // Filter out system onboarding tasks and map to [key, template, isCustom].
  // isCustom is determined by the flag written at creation time.
  const filtered: [string, TaskTemplate, boolean][] =
    tab === 'stat'
      ? Object.entries(taskTemplates)
          .filter(([k, t]) => !SYSTEM_TASK_IDS.has(k) && !SYSTEM_TASK_IDS.has(t.id ?? ''))
          .map(([k, t]): [string, TaskTemplate, boolean] => [k, t, t.isCustom === true])
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
