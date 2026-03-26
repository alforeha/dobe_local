import type { TaskTemplate } from '../../../../../types';
import { TaskBlock } from './TaskBlock';

interface TaskRoomBodyProps {
  templates: [string, TaskTemplate, boolean][]; // [key, template, isCustom]
  onEdit: (key: string, template: TaskTemplate) => void;
}

export function TaskRoomBody({ templates, onEdit }: TaskRoomBodyProps) {
  if (templates.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">No tasks here yet.</p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {templates.map(([key, t, isCustom]) => (
        <TaskBlock
          key={key}
          templateKey={key}
          name={t.name}
          icon={t.icon}
          taskType={t.taskType}
          secondaryTag={t.secondaryTag}
          xpTotal={Object.values(t.xpAward).reduce((a, b) => a + b, 0) + (t.xpBonus ?? 0)}
          isCustom={isCustom}
          onEdit={isCustom ? () => onEdit(key, t) : undefined}
        />
      ))}
    </div>
  );
}
