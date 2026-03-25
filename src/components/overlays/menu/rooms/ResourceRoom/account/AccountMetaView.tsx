// ─────────────────────────────────────────
// AccountMetaView — read-only display of AccountMeta. W25 / G.
// ─────────────────────────────────────────

import type { Resource, AccountMeta } from '../../../../../../types/resource';
import { resolveIcon } from '../../../../../../constants/iconMap';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { NotesLogViewer } from '../../../../../shared/NotesLogViewer';

interface AccountMetaViewProps {
  meta: AccountMeta;
  resource: Resource;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate.slice(0, 10) + 'T00:00:00');
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatBalance(n: number): string {
  return '$' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const RECURRENCE_LABEL: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
};

export function AccountMetaView({ meta, resource }: AccountMetaViewProps) {
  const allResources = useResourceStore((s) => s.resources);

  const {
    kind, institution, balance, dueDate,
    pendingTransactions, accountTasks, notes,
    linkedResourceRef, linkedAccountRef,
  } = meta;

  // What this account points to
  const parentResource = linkedResourceRef ? (allResources[linkedResourceRef] ?? null) : null;
  const parentAccount  = linkedAccountRef  ? (allResources[linkedAccountRef]  ?? null) : null;

  // Reverse lookup: other accounts that draw from this account
  const childAccounts = Object.values(allResources).filter(
    (r) => r.id !== resource.id &&
           r.type === 'account' &&
           (r.meta as AccountMeta).linkedAccountRef === resource.id,
  );

  const hasLinked = parentResource || parentAccount || childAccounts.length > 0;

  const hasAny =
    kind || institution || balance !== 0 || dueDate ||
    (pendingTransactions && pendingTransactions.length > 0) ||
    (accountTasks && accountTasks.length > 0) ||
    hasLinked ||
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

      <div className="flex gap-2">
        <span className="text-gray-400 w-16 shrink-0">Kind</span>
        <span>{capitalise(kind)}</span>
      </div>

      {institution && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Institution</span>
          <span>{institution}</span>
        </div>
      )}

      {balance !== 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Balance</span>
          <span>{formatBalance(balance)}</span>
        </div>
      )}

      {dueDate && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Due</span>
          <span>{formatDate(dueDate)}</span>
        </div>
      )}

      {/* Pending transactions */}
      {pendingTransactions && pendingTransactions.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Pending</span>
          <div className="flex flex-col gap-0.5">
            {pendingTransactions.map((t) => (
              <span key={t.id} className="flex items-center gap-1.5">
                <span className="truncate">{t.description}</span>
                <span className="text-gray-400">— {t.status}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transaction tasks */}
      {accountTasks && accountTasks.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Tasks</span>
          <div className="flex flex-col gap-0.5">
            {accountTasks.map((t) => (
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
      {hasLinked && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Linked</span>
          <div className="flex flex-wrap gap-1">
            {parentResource && (
              <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs">
                {resolveIcon(parentResource.icon)}
                <span>{parentResource.name}</span>
              </span>
            )}
            {parentAccount && (
              <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded text-xs">
                {resolveIcon(parentAccount.icon)}
                <span>{parentAccount.name}</span>
              </span>
            )}
            {childAccounts.map((r) => (
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
