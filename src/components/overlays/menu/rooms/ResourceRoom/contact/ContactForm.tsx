// ─────────────────────────────────────────
// ContactForm — add / edit form for Contact resources.
// Used in both the Add flow (no `existing` prop) and the Edit flow
// (`existing` prop pre-populates all fields).
//
// On save:
//   1. Builds ContactMeta + Resource object
//   2. Writes to useResourceStore
//   3. Writes to storageLayer (resource key)
//   4. If new: appends ID to user.resources.contacts + persists User
//   5. Calls generateScheduledTasks() to create/update birthday PlannedEvent
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, ContactMeta } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateScheduledTasks } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';

interface ContactFormProps {
  /** Present when editing an existing Resource. */
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(resource: Resource | undefined): ContactMeta | null {
  if (!resource || resource.type !== 'contact') return null;
  return resource.meta as ContactMeta;
}

export function ContactForm({ existing, onSaved, onCancel }: ContactFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [phone, setPhone] = useState(prevMeta?.info?.phone ?? '');
  const [email, setEmail] = useState(prevMeta?.info?.email ?? '');
  const [birthday, setBirthday] = useState(prevMeta?.info?.birthday ?? '');
  const [address, setAddress] = useState(prevMeta?.info?.address ?? '');
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');

  // Linked resources: select from all available resources (excluding self)
  const allResources = useResourceStore((s) => s.resources);
  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const [linkedRefs, setLinkedRefs] = useState<string[]>(
    prevMeta?.linkedResourceRefs ?? [],
  );

  const linkableResources = Object.values(allResources).filter(
    (r) => r.id !== existing?.id,
  );

  function toggleLink(id: string) {
    setLinkedRefs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const canSave = displayName.trim().length > 0;

  function handleSave() {
    if (!canSave) return;

    const meta: ContactMeta = {
      info: {
        birthday: birthday || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      },
      customTag: prevMeta?.customTag ?? null,
      groups: prevMeta?.groups ?? [],
      notes,
      linkedResourceRefs: linkedRefs.length > 0 ? linkedRefs : undefined,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '👤',
      description: existing?.description ?? '',
      type: 'contact',
      attachments: existing?.attachments ?? [],
      log: existing?.log ?? [],
      meta,
    };

    // Write to store + storage
    setResource(resource);

    // If new contact: register in user.resources.contacts
    if (!existing && user) {
      const updatedUser = {
        ...user,
        resources: {
          ...user.resources,
          contacts: user.resources.contacts.includes(resource.id)
            ? user.resources.contacts
            : [...user.resources.contacts, resource.id],
        },
      };
      setUser(updatedUser);
    }

    // Generate/update birthday PlannedEvent (or other scheduled tasks)
    generateScheduledTasks(resource);

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
          {existing ? 'Edit Contact' : 'New Contact'}
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
          placeholder="Full name"
          maxLength={100}
        />
        <TextInput
          label="Phone"
          value={phone}
          onChange={setPhone}
          placeholder="+1 555 000 0000"
          maxLength={40}
        />
        <TextInput
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="email@example.com"
          maxLength={120}
        />

        {/* Birthday date input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Birthday
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        <TextInput
          label="Address"
          value={address}
          onChange={setAddress}
          placeholder="123 Main St"
          maxLength={200}
        />

        {/* Notes textarea */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this contact…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>

        {/* Linked resources */}
        {linkableResources.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Linked Resources
            </label>
            <div className="flex flex-wrap gap-1.5">
              {linkableResources.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleLink(r.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                    linkedRefs.includes(r.id)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <span>{r.icon || '📦'}</span>
                  <span>{r.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
