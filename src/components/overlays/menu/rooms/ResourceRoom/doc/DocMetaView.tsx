// ─────────────────────────────────────────
// DocMetaView — read-only display of DocMeta. W27 / I.
// ─────────────────────────────────────────

import type { Resource, DocMeta } from '../../../../../../types/resource';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { NotesLogViewer } from '../../../../../shared/NotesLogViewer';

interface DocMetaViewProps {
  meta: DocMeta;
  resource: Resource;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function DocMetaView({ meta, resource }: DocMetaViewProps) {
  const allResources = useResourceStore((s) => s.resources);

  const { docType, url, expiryDate, walkthroughType, linkedResourceRef, linkedResourceRefs, notes } = meta;

  // Resolve explicitly linked resources (new multi-ref + old single ref)
  const linkedIds = [
    ...(linkedResourceRefs ?? []),
    ...(linkedResourceRef ? [linkedResourceRef] : []),
  ];
  const linkedResolved = linkedIds
    .map((id) => allResources[id] ?? null)
    .filter(Boolean);

  // Reverse lookup: resources that list this doc in their linkedDocs
  const linkedReverse = Object.values(allResources).filter((r) => {
    if (r.id === resource.id) return false;
    const m = r.meta as unknown as { linkedDocs?: string[] };
    if (Array.isArray(m.linkedDocs)) return m.linkedDocs.includes(resource.id);
    return false;
  });

  const allLinked = [...linkedResolved, ...linkedReverse];

  const hasAny = docType || url || expiryDate || walkthroughType || allLinked.length > 0 || (notes && notes.length > 0);

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

      {docType && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Type</span>
          <span>{capitalise(docType)}</span>
        </div>
      )}

      {url && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">URL</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-blue-500 hover:text-blue-600 underline underline-offset-2"
          >
            {url}
          </a>
        </div>
      )}

      {expiryDate && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Expires</span>
          <span>{formatDate(expiryDate)}</span>
        </div>
      )}

      {walkthroughType && walkthroughType !== 'none' && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Walkthrough</span>
          <span>{capitalise(walkthroughType)}</span>
        </div>
      )}

      {/* Course progression stub */}
      <div className="flex gap-2">
        <span className="text-gray-400 w-20 shrink-0">Course</span>
        <span className="italic text-gray-400">Coming soon</span>
      </div>

      {/* Linked resources */}
      {allLinked.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-20 shrink-0">Linked</span>
          <div className="flex flex-wrap gap-1">
            {allLinked.map((r) => (
              <span
                key={r!.id}
                className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs"
              >
                {resolveIcon(r!.icon)}
                <span>{r!.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <NotesLogViewer notes={notes} labelWidth="w-20" />
    </div>
  );
}
