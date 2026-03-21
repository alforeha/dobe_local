// ─────────────────────────────────────────
// ContactMetaView — read-only display of ContactMeta fields.
// Used inside ResourceBlockExpanded when resource.type === 'contact'.
// ─────────────────────────────────────────

import type { ContactMeta } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';

interface ContactMetaViewProps {
  meta: ContactMeta;
}

function daysUntilAnnual(isoDate: string): number | null {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const parts = isoDate.slice(0, 10).split('-');
  if (parts.length < 3) return null;
  const thisYear = today.getFullYear();
  const candidate = new Date(`${thisYear}-${parts[1]}-${parts[2]}T00:00:00`);
  if (candidate < today) candidate.setFullYear(thisYear + 1);
  return Math.round((candidate.getTime() - today.getTime()) / 86_400_000);
}

function formatBirthday(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export function ContactMetaView({ meta }: ContactMetaViewProps) {
  const resources = useResourceStore((s) => s.resources);
  const { info, notes, groups, customTag, linkedResourceRefs } = meta;

  const hasAny =
    info.phone ||
    info.email ||
    info.birthday ||
    info.address ||
    notes ||
    customTag ||
    (groups && groups.length > 0) ||
    (linkedResourceRefs && linkedResourceRefs.length > 0);

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {info.phone && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Phone</span>
          <span>{info.phone}</span>
        </div>
      )}
      {info.email && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Email</span>
          <span className="truncate">{info.email}</span>
        </div>
      )}
      {info.birthday && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-16 shrink-0">Birthday</span>
          <span className="flex items-center gap-1.5">
            {formatBirthday(info.birthday)}
            {(() => {
              const d = daysUntilAnnual(info.birthday);
              if (d === null) return null;
              if (d === 0)
                return (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                    Today! 🎂
                  </span>
                );
              if (d <= 14)
                return (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                    in {d}d
                  </span>
                );
              if (d <= 30)
                return (
                  <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                    in {d}d
                  </span>
                );
              return null;
            })()}
          </span>
        </div>
      )}
      {info.address && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Address</span>
          <span>{info.address}</span>
        </div>
      )}
      {notes && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Notes</span>
          <span className="whitespace-pre-line">{notes}</span>
        </div>
      )}
      {customTag && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Tag</span>
          <span className="bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">{customTag}</span>
        </div>
      )}
      {groups && groups.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Groups</span>
          <span>{groups.join(', ')}</span>
        </div>
      )}
      {linkedResourceRefs && linkedResourceRefs.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Linked</span>
          <span>
            {linkedResourceRefs
              .map((id) => resources[id]?.name ?? id)
              .join(', ')}
          </span>
        </div>
      )}
    </div>
  );
}
