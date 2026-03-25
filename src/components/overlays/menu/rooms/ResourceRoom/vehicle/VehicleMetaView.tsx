// ─────────────────────────────────────────
// VehicleMetaView — read-only display of VehicleMeta. W24.
// ─────────────────────────────────────────

import type { Resource, VehicleMeta, AccountMeta, DocMeta } from '../../../../../../types/resource';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { NotesLogViewer } from '../../../../../shared/NotesLogViewer';

interface VehicleMetaViewProps {
  meta: VehicleMeta;
  resource: Resource;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
};

export function VehicleMetaView({ meta, resource }: VehicleMetaViewProps) {
  const allResources = useResourceStore((s) => s.resources);

  const {
    make, model, year, mileage, licensePlate,
    insuranceExpiry, serviceNextDate, maintenanceTasks, notes,
  } = meta;

  // Linked: accounts/docs whose linkedResourceRef points to this vehicle
  const linkedResources = Object.values(allResources).filter((r) => {
    if (r.type === 'account')
      return (r.meta as AccountMeta).linkedResourceRef === resource.id;
    if (r.type === 'doc')
      return (r.meta as DocMeta).linkedResourceRef === resource.id;
    return false;
  });

  const hasAny =
    make || model || year || mileage != null || licensePlate ||
    insuranceExpiry || serviceNextDate ||
    (maintenanceTasks && maintenanceTasks.length > 0) ||
    linkedResources.length > 0 ||
    (notes && notes.length > 0);

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {/* Icon + name header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl leading-none shrink-0" aria-hidden="true">
          {resolveIcon(resource.icon)}
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
          {resource.name}
        </span>
      </div>

      {make && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Make</span>
          <span>{make}</span>
        </div>
      )}
      {model && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Model</span>
          <span>{model}</span>
        </div>
      )}
      {year != null && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Year</span>
          <span>{year}</span>
        </div>
      )}
      {licensePlate && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Plate</span>
          <span>{licensePlate}</span>
        </div>
      )}
      {mileage != null && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Mileage</span>
          <span>{mileage.toLocaleString()} km</span>
        </div>
      )}
      {insuranceExpiry && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Insurance</span>
          <span>{formatDate(insuranceExpiry)}</span>
        </div>
      )}
      {serviceNextDate && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Service</span>
          <span>{formatDate(serviceNextDate)}</span>
        </div>
      )}

      {/* Maintenance tasks */}
      {maintenanceTasks && maintenanceTasks.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Tasks</span>
          <div className="flex flex-col gap-0.5">
            {maintenanceTasks.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5">
                {t.icon && <span>{t.icon}</span>}
                <span>{t.name}</span>
                <span className="text-gray-400">
                  — {RECURRENCE_LABEL[t.recurrence.frequency] ?? t.recurrence.frequency}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Linked resources */}
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

      <NotesLogViewer notes={notes} />
    </div>
  );
}
