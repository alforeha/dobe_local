// ─────────────────────────────────────────
// DocForm — add / edit form for Doc resources. W27 / I.
// courseProgress is stub only per D42 — display placeholder only.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, DocMeta, DocType, ResourceNote } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateGTDItems, generateDocTasks_stub } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';

interface DocFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): DocMeta | null {
  if (!r || r.type !== 'doc') return null;
  return r.meta as DocMeta;
}

const DOC_TYPE_OPTIONS: { value: DocType; label: string }[] = [
  { value: 'reference', label: 'Reference' },
  { value: 'course',    label: 'Course' },
  { value: 'manual',    label: 'Manual' },
  { value: 'contract',  label: 'Contract' },
  { value: 'receipt',   label: 'Receipt' },
  { value: 'other',     label: 'Other' },
];

const WALKTHROUGH_OPTIONS: { value: 'linear' | 'checklist' | 'none'; label: string }[] = [
  { value: 'none',      label: 'None' },
  { value: 'linear',    label: 'Linear' },
  { value: 'checklist', label: 'Checklist' },
];

const SELECT_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-40';

const DATE_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500';

export function DocForm({ existing, onSaved, onCancel }: DocFormProps) {
  const prevMeta = existingMeta(existing);

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'log');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [docType, setDocType] = useState<DocType>(prevMeta?.docType ?? 'reference');
  const [url, setUrl] = useState(prevMeta?.url ?? '');
  const [expiryDate, setExpiryDate] = useState(prevMeta?.expiryDate ?? '');
  const [expiryLeadDays, setExpiryLeadDays] = useState<number>(
    prevMeta?.expiryLeadDays ?? 30,
  );
  const [walkthroughType, setWalkthroughType] = useState<'linear' | 'checklist' | 'none'>(
    prevMeta?.walkthroughType ?? 'none',
  );
  const [linkedRef, setLinkedRef] = useState(prevMeta?.linkedResourceRefs?.[0] ?? '');
  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0;

  const now = new Date().toISOString();

  function handleSave() {
    if (!canSave) return;

    const meta: DocMeta = {
      docType,
      content: prevMeta?.content ?? '',
      linkedResourceRef: prevMeta?.linkedResourceRef ?? null,
      courseRef: prevMeta?.courseRef ?? null,
      progression: null,
      tags: prevMeta?.tags ?? [],
      createdAt: prevMeta?.createdAt ?? now,
      updatedAt: now,
      url: url.trim() || null,
      expiryDate: expiryDate || null,
      expiryLeadDays: expiryDate ? expiryLeadDays : undefined,
      walkthroughType,
      linkedResourceRefs: linkedRef.trim() ? [linkedRef.trim()] : undefined,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
      description: existing?.description ?? '',
      type: 'doc',
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
          docs: user.resources.docs.includes(resource.id)
            ? user.resources.docs
            : [...user.resources.docs, resource.id],
        },
      };
      setUser(updatedUser);
    }

    generateGTDItems(resource);
    generateDocTasks_stub();
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
          {existing ? 'Edit Doc' : 'New Doc'}
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
            placeholder="e.g. Car Manual"
            maxLength={100}
          />
        </div>

        {/* Row 2: Doc type + URL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Type
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
              className={SELECT_CLS}
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <TextInput
            label="URL"
            value={url}
            onChange={setUrl}
            placeholder="https://…"
            maxLength={500}
          />
        </div>

        {/* Row 3: Expiry date + Reminder */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={DATE_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Reminder
            </label>
            <select
              value={expiryDate ? expiryLeadDays : ''}
              disabled={!expiryDate}
              onChange={(e) => setExpiryLeadDays(Number(e.target.value))}
              className={SELECT_CLS}
            >
              <option value={-1}>Never</option>
              <option value={0}>Day of</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
            </select>
          </div>
        </div>

        {/* Row 4: Walkthrough type */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Walkthrough
            </label>
            <select
              value={walkthroughType}
              onChange={(e) =>
                setWalkthroughType(e.target.value as 'linear' | 'checklist' | 'none')
              }
              className={SELECT_CLS}
            >
              {WALKTHROUGH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div /> {/* spacer */}
        </div>

        {/* Linked resource */}
        <TextInput
          label="Linked resource"
          value={linkedRef}
          onChange={setLinkedRef}
          placeholder="Resource ID or name"
          maxLength={120}
        />

        {/* Notes log */}
        <NotesLogEditor notes={notes} onChange={setNotes} />

        {/* Course progression — coming soon stub */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-400 italic">
          Course progression coming soon.
        </div>
      </div>
    </div>
  );
}
