// ─────────────────────────────────────────
// ResourceTasksTab — task definitions derived from resource meta.
// Computed at render time (no scheduleStore reads). L.
// Groups: Homes (chores), Vehicles (maintenance), Accounts (account tasks).
// ─────────────────────────────────────────

import { useMemo } from 'react';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import type {
  HomeMeta,
  VehicleMeta,
  AccountMeta,
  RecurrenceRule,
} from '../../../../../types/resource';
import { resolveIcon } from '../../../../../constants/iconMap';

// ── Recurrence label helper ────────────────────────────────────────────────────

function recurrenceLabel(rule: RecurrenceRule): string {
  const freq =
    rule.frequency === 'daily'   ? 'day' :
    rule.frequency === 'weekly'  ? 'week' :
    rule.frequency === 'monthly' ? 'month' :
    'year';

  const intervalPart = rule.interval === 1 ? `Every ${freq}` : `Every ${rule.interval} ${freq}s`;

  if (rule.frequency === 'weekly' && rule.days.length > 0) {
    const DOW: Record<string, string> = {
      sun: 'Su', mon: 'Mo', tue: 'Tu', wed: 'We',
      thu: 'Th', fri: 'Fr', sat: 'Sa',
    };
    const dayStr = rule.days.map((d) => DOW[d] ?? d).join(' ');
    return `${intervalPart} · ${dayStr}`;
  }

  return intervalPart;
}

// ── Row component ──────────────────────────────────────────────────────────────

interface TaskRowProps {
  icon: string;
  name: string;
  recurrenceLabel: string;
  detail?: string; // e.g. "assigned to" or "7d reminder"
}

function TaskRow({ icon, name, recurrenceLabel: rl, detail }: TaskRowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
      <span className="text-base shrink-0 leading-none" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate min-w-0">
        {name}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
        {rl}
      </span>
      {detail && (
        <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-1">
          · {detail}
        </span>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ResourceTasksTab() {
  const resources = useResourceStore((s) => s.resources);

  const sections = useMemo(() => {
    const result: Array<{
      resourceId: string;
      resourceIcon: string;
      resourceName: string;
      rows: TaskRowProps[];
    }> = [];

    for (const resource of Object.values(resources)) {
      const rows: TaskRowProps[] = [];
      const rIcon = resolveIcon(resource.icon);

      if (resource.type === 'home') {
        const meta = resource.meta as HomeMeta;
        for (const chore of meta.chores ?? []) {
          const icon = chore.icon ? resolveIcon(chore.icon) : rIcon;
          const detail =
            chore.assignedTo && chore.assignedTo !== 'all'
              ? `assigned`
              : chore.assignedTo === 'all'
              ? 'all members'
              : undefined;
          rows.push({
            icon,
            name: chore.name,
            recurrenceLabel: recurrenceLabel(chore.recurrence),
            detail,
          });
        }
      }

      if (resource.type === 'vehicle') {
        const meta = resource.meta as VehicleMeta;
        for (const task of meta.maintenanceTasks ?? []) {
          const icon = task.icon ? resolveIcon(task.icon) : rIcon;
          const detail =
            task.reminderLeadDays === -1   ? 'no reminder' :
            task.reminderLeadDays === 0    ? 'day-of' :
            `${task.reminderLeadDays}d reminder`;
          rows.push({
            icon,
            name: task.name,
            recurrenceLabel: recurrenceLabel(task.recurrence),
            detail,
          });
        }
      }

      if (resource.type === 'account') {
        const meta = resource.meta as AccountMeta;
        for (const task of meta.accountTasks ?? []) {
          const icon = task.icon ? resolveIcon(task.icon) : rIcon;
          const detail =
            task.reminderLeadDays === -1   ? 'no reminder' :
            task.reminderLeadDays === 0    ? 'day-of' :
            `${task.reminderLeadDays}d reminder`;
          rows.push({
            icon,
            name: task.name,
            recurrenceLabel: recurrenceLabel(task.recurrence),
            detail,
          });
        }
      }

      if (rows.length > 0) {
        result.push({
          resourceId: resource.id,
          resourceIcon: rIcon,
          resourceName: resource.name,
          rows,
        });
      }
    }

    return result;
  }, [resources]);

  if (sections.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10 px-6 leading-relaxed">
        Add tasks to your resources to see them here — set up chores in Homes, maintenance in Vehicles, or transaction tasks in Accounts.
      </p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {sections.map((section) => (
        <div key={section.resourceId}>
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
            <span className="text-sm leading-none">{section.resourceIcon}</span>
            {section.resourceName}
          </h3>
          <div className="space-y-1">
            {section.rows.map((row, i) => (
              <TaskRow key={i} {...row} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
