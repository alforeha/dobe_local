// ─────────────────────────────────────────
// HomeMetaView — read-only display of HomeMeta. W23.
// ─────────────────────────────────────────

import type { Resource, HomeMeta, AccountMeta, DocMeta } from '../../../../../../types/resource';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { NotesLogViewer } from '../../../../../shared/NotesLogViewer';

interface HomeMetaViewProps {
  meta: HomeMeta;
  resource: Resource;
}

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

export function HomeMetaView({ meta, resource }: HomeMetaViewProps) {
  const allResources = useResourceStore((s) => s.resources);

  const { rooms, chores, members, notes } = meta;

  // Members: resolve contact IDs stored on this home
  const memberContacts = (members ?? [])
    .map((id) => allResources[id])
    .filter(Boolean) as Resource[];

  // Linked: accounts/docs whose linkedResourceRef points to this home
  const linkedResources = Object.values(allResources).filter((r) => {
    if (r.type === 'account')
      return (r.meta as AccountMeta).linkedResourceRef === resource.id;
    if (r.type === 'doc')
      return (r.meta as DocMeta).linkedResourceRef === resource.id;
    return false;
  });

  const hasAny =
    memberContacts.length > 0 ||
    linkedResources.length > 0 ||
    (rooms && rooms.length > 0) ||
    (chores && chores.length > 0) ||
    (notes && notes.length > 0);

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {/* icon + name header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl leading-none shrink-0" aria-hidden="true">
          {resolveIcon(resource.icon)}
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {resource.name}
        </span>
      </div>

      {/* Members */}
      {memberContacts.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Members</span>
          <div className="flex flex-wrap gap-1">
            {memberContacts.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded text-xs"
              >
                {resolveIcon(c.icon)}
                <span>{c.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Linked accounts/docs */}
      {linkedResources.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Linked</span>
          <div className="flex flex-wrap gap-1">
            {linkedResources.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs"
              >
                {resolveIcon(r.icon)}
                <span>{r.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rooms */}
      {rooms && rooms.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Rooms</span>
          <div className="flex flex-wrap gap-1">
            {rooms.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded"
              >
                {r.icon && <span>{r.icon}</span>}
                <span>{r.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chores */}
      {chores && chores.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Chores</span>
          <div className="flex flex-col gap-0.5">
            {chores.map((c) => (
              <span key={c.id} className="flex items-center gap-1.5">
                {c.icon && <span>{c.icon}</span>}
                <span>{c.name}</span>
                <span className="text-gray-400">
                  — {RECURRENCE_LABEL[c.recurrence.frequency] ?? c.recurrence.frequency}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <NotesLogViewer notes={notes} labelWidth="w-16" />
    </div>
  );
}
