// ─────────────────────────────────────────
// VehicleMetaView — read-only display of VehicleMeta. W24.
// ─────────────────────────────────────────

import type { VehicleMeta } from '../../../../../../types/resource';

interface VehicleMetaViewProps {
  meta: VehicleMeta;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function daysUntil(isoDate: string): number | null {
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const target = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  if (isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function VehicleMetaView({ meta }: VehicleMetaViewProps) {
  const { make, model, year, mileage, licensePlate, insuranceExpiry, serviceNextDate, notes } = meta;

  const hasAny = make || model || year || mileage || licensePlate || insuranceExpiry || serviceNextDate || notes;

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {(make || model) && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Vehicle</span>
          <span>
            {[make, model, year ? String(year) : null].filter(Boolean).join(' ')}
          </span>
        </div>
      )}
      {mileage != null && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Mileage</span>
          <span>{mileage.toLocaleString()}</span>
        </div>
      )}
      {licensePlate && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Plate</span>
          <span>{licensePlate}</span>
        </div>
      )}
      {insuranceExpiry && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-16 shrink-0">Insurance</span>
          <span className="flex items-center gap-1.5">
            {formatDate(insuranceExpiry)}
            {(() => {
              const d = daysUntil(insuranceExpiry);
              if (d === null) return null;
              if (d <= 0) return (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Expired</span>
              );
              if (d <= 30) return (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">in {d}d ⚠</span>
              );
              return null;
            })()}
          </span>
        </div>
      )}
      {serviceNextDate && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-16 shrink-0">Service</span>
          <span className="flex items-center gap-1.5">
            {formatDate(serviceNextDate)}
            {(() => {
              const d = daysUntil(serviceNextDate);
              if (d === null) return null;
              if (d <= 0) return (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Overdue</span>
              );
              if (d <= 14) return (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">in {d}d</span>
              );
              return null;
            })()}
          </span>
        </div>
      )}
      {notes && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Notes</span>
          <span className="whitespace-pre-line">{notes}</span>
        </div>
      )}
    </div>
  );
}
