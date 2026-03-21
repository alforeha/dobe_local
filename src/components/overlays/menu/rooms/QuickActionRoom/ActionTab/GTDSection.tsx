import { useScheduleStore } from '../../../../../../stores/useScheduleStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { GTDTaskBlock } from './GTDTaskBlock';

export function GTDSection() {
  const user = useUserStore((s) => s.user);
  const tasks = useScheduleStore((s) => s.tasks);
  const taskTemplates = useScheduleStore((s) => s.taskTemplates);

  const gtdList = user?.lists.gtdList ?? [];
  const gtdTasks = gtdList.map((id) => tasks[id]).filter(Boolean);

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          GTD List
        </h3>
        <button type="button" className="text-xs text-blue-500 font-medium">
          + Add
        </button>
      </div>
      {gtdTasks.length === 0 ? (
        <p className="text-xs text-gray-400 py-2 text-center">No GTD tasks.</p>
      ) : (
        <div className="space-y-1.5">
          {gtdTasks.map((task) => {
            const templateName =
              taskTemplates[task.templateRef]?.name ?? task.templateRef;
            return (
              <GTDTaskBlock key={task.id} task={task} templateName={templateName} />
            );
          })}
        </div>
      )}
    </div>
  );
}
