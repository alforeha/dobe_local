// ─────────────────────────────────────────
// DocForm — add / edit form for Doc resources. W27.
// courseProgress is stub only per D42 — display placeholder only.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, DocMeta, DocType } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { storageSet, storageKey } from '../../../../../../storage';
import { generateGTDItems, generateDocTasks_stub } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';

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
  { value: 'other',     label: 'Other' },
];

const WALKTHROUGH_OPTIONS: { value: 'linear' | 'checklist' | 'none'; label: string }[] = [
  { value: 'none',      label: 'None' },
  { value: 'linear',    label: 'Linear' },
  { value: 'checklist', label: 'Checklist' },
];

export function DocForm({ existing, onSaved, onCancel }: DocFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [docType, setDocType] = useState<DocType>(prevMeta?.docType ?? 'reference');
  const [url, setUrl] = useState(prevMeta?.url ?? '');
  const [expiryDate, setExpiryDate] = useState(prevMeta?.expiryDate ?? '');
  const [walkthroughType, setWalkthroughType] = useState<'linear' | 'checklist' | 'none'>(
    prevMeta?.walkthroughType ?? 'none',
  );
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0 && docType.trim().length > 0;

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
      walkthroughType,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '📄',
      description: existing?.description ?? '',
      type: 'doc',
      attachments: existing?.attachments ?? [],
      log: existing?.log ?? [],
      meta,
    };

    setResource(resource);
    storageSet(storageKey.resource(resource.id), resource);

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
      storageSet('user', updatedUser);
    }

    generateGTDItems(resource);
    // Course progression is a stub per D42 — call noted here as a stub
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
        <TextInput
          label="Name *"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Car Manual"
          maxLength={100}
        />

        {/* Doc type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Doc Type *</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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

        {/* Expiry date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Expiry Date
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400">GTD task fires when within 30 days.</p>
        </div>

        {/* Walkthrough type */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Walkthrough Type
          </label>
          <select
            value={walkthroughType}
            onChange={(e) =>
              setWalkthroughType(e.target.value as 'linear' | 'checklist' | 'none')
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {WALKTHROUGH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Course progression — stub per D42 */}
        {(docType === 'course' || docType === 'walkthrough') && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2.5 text-xs text-gray-400 italic">
            Course progression coming soon.
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this doc…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
