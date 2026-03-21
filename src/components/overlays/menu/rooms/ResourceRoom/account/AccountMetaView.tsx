// ─────────────────────────────────────────
// AccountMetaView — read-only display of AccountMeta. W25.
// ─────────────────────────────────────────

import type { AccountMeta } from '../../../../../../types/resource';

interface AccountMetaViewProps {
  meta: AccountMeta;
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

export function AccountMetaView({ meta }: AccountMetaViewProps) {
  const { kind, institution, accountNickname, balance, dueDate, pendingTransactions, notes } = meta;

  const hasAny = kind || institution || accountNickname || balance != null || dueDate || notes;

  if (!hasAny) {
    return <p className="text-xs text-gray-400 italic mb-1">No details on file.</p>;
  }

  return (
    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-1">
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
      {accountNickname && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Nickname</span>
          <span>{accountNickname}</span>
        </div>
      )}
      {balance != null && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Balance</span>
          <span>{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}
      {dueDate && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 w-16 shrink-0">Due</span>
          <span className="flex items-center gap-1.5">
            {formatDate(dueDate)}
            {(() => {
              const d = daysUntil(dueDate);
              if (d === null) return null;
              if (d <= 0) return (
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Overdue</span>
              );
              if (d <= 7) return (
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">in {d}d ⚠</span>
              );
              return null;
            })()}
          </span>
        </div>
      )}
      {pendingTransactions && pendingTransactions.length > 0 && (
        <div className="flex gap-2">
          <span className="text-gray-400 w-16 shrink-0">Pending</span>
          <span>{pendingTransactions.filter((t) => t.status === 'pending').length} transaction(s)</span>
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
