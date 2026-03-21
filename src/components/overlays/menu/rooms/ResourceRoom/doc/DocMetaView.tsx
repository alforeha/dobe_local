// ─────────────────────────────────────────
// DocMetaView — read-only display of DocMeta. W27.
// ─────────────────────────────────────────

import type { DocMeta } from '../../../../../../types/resource';

interface DocMetaViewProps {
  meta: DocMeta;
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

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DocMetaView({ meta }: DocMetaViewProps) {
  const { docType, url, expiryDate, walkthroughType, notes } = meta;

  const hasAny = docType || url || expiryDate || walkthroughType || notes;

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
      {docType && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Type</span>
          <span>{capitalise(docType)}</span>
        </div>
      )}
      {url && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">URL</span>
          <span className="truncate text-blue-500">{url}</span>
        </div>
      )}
      {walkthroughType && walkthroughType !== 'none' && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Walkthrough</span>
          <span>{capitalise(walkthroughType)}</span>
        </div>
      )}
      {expiryDate && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-20 shrink-0">Expires</span>
          <span className="flex items-center gap-1.5">
            {formatDate(expiryDate)}
            {(() => {
              const d = daysUntil(expiryDate);
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
      {/* Course progression stub */}
      {(docType === 'course' || docType === 'walkthrough') && (
        <div className="text-gray-400 italic">Course progression coming soon.</div>
      )}
      {notes && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Notes</span>
          <span className="whitespace-pre-line">{notes}</span>
        </div>
      )}
    </div>
  );
}
