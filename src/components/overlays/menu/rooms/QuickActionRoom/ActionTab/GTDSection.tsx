import { useState } from 'react';
import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { GTDTaskBlock } from './GTDTaskBlock';
import { GTDManualBlock } from './GTDManualBlock';
import { STARTER_TEMPLATE_IDS } from '../../../../../../coach/StarterQuestLibrary';
import { AddGTDItemPopup } from './AddGTDItemPopup';

export function GTDSection() {
  const user = useUserStore((s) => s.user);
  const tasks = useScheduleStore((s) => s.tasks);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const gtdList = user?.lists.gtdList ?? [];
  const manualGtdList = user?.lists.manualGtdList ?? [];

  // Templates managed entirely by system auto-checks — never shown as manual GTD items
  const AUTO_TRACKED = new Set<string>([STARTER_TEMPLATE_IDS.setupSchedule]);

  // Resolve system/resource-generated Task refs — pending only, excluding auto-tracked
  const systemTasks = gtdList
    .map((id) => tasks[id])
    .filter((t) => Boolean(t) && t.completionState === 'pending' && !AUTO_TRACKED.has(t.templateRef));

  // Manual items — pending only
  const manualItems = manualGtdList.filter((i) => i.completionState === 'pending');

  const isEmpty = systemTasks.length === 0 && manualItems.length === 0;

  return (
    <>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            GTD List
          </h3>
          <button
            type="button"
            onClick={() => setShowAddPopup(true)}
            className="text-xs text-blue-500 font-medium"
          >
            + Add
          </button>
        </div>
        {isEmpty ? (
          <p className="text-xs text-gray-400 py-2 text-center">No GTD tasks.</p>
        ) : (
          <div className="space-y-1.5">
            {systemTasks.map((task) => {
              const templateName =
                taskTemplates[task.templateRef]?.name ?? task.templateRef;
              return (
                <GTDTaskBlock key={task.id} task={task} templateName={templateName} />
              );
            })}
            {manualItems.map((item) => (
              <GTDManualBlock key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      {showAddPopup && (
        <AddGTDItemPopup onClose={() => setShowAddPopup(false)} />
      )}
    </>
  );
}
