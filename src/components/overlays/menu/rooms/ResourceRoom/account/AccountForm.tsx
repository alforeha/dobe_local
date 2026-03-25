// ─────────────────────────────────────────
// AccountForm — add / edit form for Account resources. W25 / G.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Resource,
  AccountMeta,
  AccountKind,
  AccountTask,
  ResourceNote,
  ResourceRecurrenceRule,
} from '../../../../../../types/resource';
import { makeDefaultRecurrenceRule, toRecurrenceRule } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { NumberInput } from '../../../../../shared/inputs/NumberInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';
import { RecurrenceRuleEditor } from '../../../../../shared/RecurrenceRuleEditor';

interface AccountFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): AccountMeta | null {
  if (!r || r.type !== 'account') return null;
  return r.meta as AccountMeta;
}

const KIND_OPTIONS: { value: AccountKind; label: string }[] = [
  { value: 'bank',         label: 'Bank' },
  { value: 'bill',         label: 'Bill' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'income',       label: 'Income' },
  { value: 'debt',         label: 'Debt' },
  { value: 'allowance',    label: 'Allowance' },
];

interface TaskDraft {
  id: string;
  icon: string;
  name: string;
  recurrence: ResourceRecurrenceRule;
  reminderLeadDays: number;
}

const SELECT_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-40';

const DATE_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500';

export function AccountForm({ existing, onSaved, onCancel }: AccountFormProps) {
  const prevMeta = existingMeta(existing);

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'finance');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<AccountKind>(prevMeta?.kind ?? 'bank');
  const [institution, setInstitution] = useState(prevMeta?.institution ?? '');
  const [balance, setBalance] = useState<number | ''>(prevMeta?.balance ?? '');
  const [dueDate, setDueDate] = useState(prevMeta?.dueDate ?? '');
  const [dueDateLeadDays, setDueDateLeadDays] = useState<number>(
    prevMeta?.dueDateLeadDays ?? 7,
  );
  const [accountTasks, setAccountTasks] = useState<TaskDraft[]>(
    prevMeta?.accountTasks?.map((t) => ({
      id: t.id,
      icon: t.icon ?? '',
      name: t.name,
      recurrence: toRecurrenceRule(t.recurrence),
      reminderLeadDays: t.reminderLeadDays ?? 7,
    })) ?? [],
  );
  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0;

  // ── Transaction tasks ──────────────────
  function addTask() {
    setAccountTasks((prev) => [
      ...prev,
      { id: uuidv4(), icon: '', name: '', recurrence: makeDefaultRecurrenceRule(), reminderLeadDays: 7 },
    ]);
  }

  function updateTask(id: string, field: keyof TaskDraft, value: string | number | ResourceRecurrenceRule) {
    setAccountTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  }

  function removeTask(id: string) {
    setAccountTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Save ───────────────────────────────
  function handleSave() {
    if (!canSave) return;

    const finalTasks: AccountTask[] = accountTasks
      .filter((t) => t.name.trim().length > 0)
      .map((t) => ({
        id: t.id,
        icon: t.icon.trim(),
        name: t.name.trim(),
        recurrence: t.recurrence,
        reminderLeadDays: t.reminderLeadDays,
      }));

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
      accountNickname: prevMeta?.accountNickname ?? null,
      dueDate: dueDate || null,
      dueDateLeadDays: dueDate ? dueDateLeadDays : undefined,
      accountTasks: finalTasks.length > 0 ? finalTasks : undefined,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
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

        {/* Row 1: Icon + Name */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <IconPicker value={iconKey} onChange={setIconKey} />
          <TextInput
            label="Name *"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Checking Account"
            maxLength={100}
          />
        </div>

        {/* Row 2: Kind + Institution */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Kind
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as AccountKind)}
              className={SELECT_CLS}
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
            placeholder="e.g. Chase"
            maxLength={100}
          />
        </div>

        {/* Row 3: Balance + Due date + Reminder */}
        <div className="grid grid-cols-3 gap-2">
          <NumberInput
            label="Balance"
            value={balance}
            onChange={setBalance}
            placeholder="0.00"
            step={0.01}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={DATE_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Reminder
            </label>
            <select
              value={dueDate ? dueDateLeadDays : ''}
              disabled={!dueDate}
              onChange={(e) => setDueDateLeadDays(Number(e.target.value))}
              className={SELECT_CLS}
            >
              <option value={-1}>Never</option>
              <option value={0}>Day of</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
        </div>

        {/* Transaction tasks section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Transaction tasks
            </span>
            <button
              type="button"
              onClick={addTask}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + Add task
            </button>
          </div>
          {accountTasks.length === 0 && (
            <p className="text-xs text-gray-400 italic">No tasks added yet.</p>
          )}
          {accountTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              {/* Icon + name + remove */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={task.icon}
                  onChange={(e) => updateTask(task.id, 'icon', e.target.value)}
                  placeholder="💳"
                  maxLength={4}
                  className="w-9 text-center rounded border border-gray-200 dark:border-gray-600 px-1 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={task.name}
                  onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                  placeholder="Task name"
                  maxLength={80}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-gray-400 hover:text-red-400 text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              {/* Recurrence rule editor */}
              <RecurrenceRuleEditor
                value={task.recurrence}
                onChange={(rule) => updateTask(task.id, 'recurrence', rule)}
              />
              {/* Reminder */}
              <div className="flex items-center gap-2">
                <select
                  value={task.reminderLeadDays}
                  onChange={(e) =>
                    updateTask(task.id, 'reminderLeadDays', Number(e.target.value))
                  }
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value={-1}>No reminder</option>
                  <option value={0}>Day of</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            </div>
          ))}
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
                  <span className="text-gray-700 dark:text-gray-200 truncate flex-1">
                    {t.description}
                  </span>
                  <span className="text-gray-500 ml-2 shrink-0">{t.status}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 italic">
              Written by shopping list — not editable here.
            </p>
          </div>
        )}

        {/* Notes log */}
        <NotesLogEditor notes={notes} onChange={setNotes} />
      </div>
    </div>
  );
}
