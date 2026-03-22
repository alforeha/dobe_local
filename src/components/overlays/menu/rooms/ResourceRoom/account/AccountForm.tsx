// ─────────────────────────────────────────
// AccountForm — add / edit form for Account resources. W25.
// kind options use the AccountKind type values from D42.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, AccountMeta, AccountKind } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { NumberInput } from '../../../../../shared/inputs/NumberInput';

interface AccountFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): AccountMeta | null {
  if (!r || r.type !== 'account') return null;
  return r.meta as AccountMeta;
}

// Kind options: use D42 type values as the canonical set
const KIND_OPTIONS: { value: AccountKind; label: string }[] = [
  { value: 'bank',         label: 'Bank' },
  { value: 'bill',         label: 'Bill' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'income',       label: 'Income' },
  { value: 'debt',         label: 'Debt' },
  { value: 'allowance',    label: 'Allowance' },
];

export function AccountForm({ existing, onSaved, onCancel }: AccountFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<AccountKind>(prevMeta?.kind ?? 'bank');
  const [institution, setInstitution] = useState(prevMeta?.institution ?? '');
  const [accountNickname, setAccountNickname] = useState(prevMeta?.accountNickname ?? '');
  const [balance, setBalance] = useState<number | ''>(prevMeta?.balance ?? '');
  const [dueDate, setDueDate] = useState(prevMeta?.dueDate ?? '');
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0 && kind.trim().length > 0;

  function handleSave() {
    if (!canSave) return;

    const meta: AccountMeta = {
      kind,
      linkedAccountRef: prevMeta?.linkedAccountRef ?? null,
      linkedResourceRef: prevMeta?.linkedResourceRef ?? null,
      linkedDocs: prevMeta?.linkedDocs ?? [],
      balance: balance === '' ? 0 : balance,
      balanceOverriddenAt: prevMeta?.balanceOverriddenAt ?? null,
      recurrenceRuleRef: prevMeta?.recurrenceRuleRef ?? null,
      amount: prevMeta?.amount ?? null,
      pendingTransactions: prevMeta?.pendingTransactions ?? [],
      transactionTaskRef: prevMeta?.transactionTaskRef ?? null,
      institution: institution.trim() || null,
      accountNickname: accountNickname.trim() || null,
      dueDate: dueDate || null,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '💳',
      description: existing?.description ?? '',
      type: 'account',
      attachments: existing?.attachments ?? [],
      log: existing?.log ?? [],
      meta,
    };

    setResource(resource);

    if (!existing && user) {
      const updatedUser = {
        ...user,
        resources: {
          ...user.resources,
          accounts: user.resources.accounts.includes(resource.id)
            ? user.resources.accounts
            : [...user.resources.accounts, resource.id],
        },
      };
      setUser(updatedUser);
    }

    generateGTDItems(resource);
    onSaved();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-700 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 text-sm hover:text-gray-600 dark:hover:text-gray-200"
        >
          ← Back
        </button>
        <h3 className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {existing ? 'Edit Account' : 'New Account'}
        </h3>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`text-sm font-semibold transition-colors ${
            canSave ? 'text-blue-500 hover:text-blue-600' : 'text-gray-300'
          }`}
        >
          Save
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <TextInput
          label="Name *"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Checking Account"
          maxLength={100}
        />

        {/* Kind selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Kind *</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as AccountKind)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {KIND_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <TextInput
          label="Institution"
          value={institution}
          onChange={setInstitution}
          placeholder="e.g. Chase, Netflix"
          maxLength={100}
        />
        <TextInput
          label="Nickname"
          value={accountNickname}
          onChange={setAccountNickname}
          placeholder="e.g. Everyday spending"
          maxLength={80}
        />
        <NumberInput
          label="Balance"
          value={balance}
          onChange={setBalance}
          placeholder="0.00"
          step={0.01}
        />

        {/* Due date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400">GTD task fires when within 7 days.</p>
        </div>

        {/* Pending transactions — read-only */}
        {prevMeta && prevMeta.pendingTransactions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Pending Transactions ({prevMeta.pendingTransactions.length})
            </label>
            <div className="space-y-1">
              {prevMeta.pendingTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-2 py-1.5 text-xs"
                >
                  <span className="text-gray-700 dark:text-gray-200 truncate flex-1">{t.description}</span>
                  <span className="text-gray-500 ml-2 shrink-0">{t.status}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 italic">Written by shopping list — not editable here.</p>
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this account…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
