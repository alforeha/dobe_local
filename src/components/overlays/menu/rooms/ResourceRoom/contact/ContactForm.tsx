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
import type { Resource, ContactMeta, ContactLink, ResourceNote } from '../../../../../../types/resource';
import { CONTACT_GROUPS } from '../../../../../../types/resource';
import type { ContactGroup } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateScheduledTasks } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';

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

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'social');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [groups, setGroups] = useState<ContactGroup[]>(
    (prevMeta?.groups ?? []) as ContactGroup[],
  );

  const [birthday, setBirthday] = useState(prevMeta?.info?.birthday ?? '');
  const [birthdayLeadDays, setBirthdayLeadDays] = useState<number>(
    prevMeta?.birthdayLeadDays ?? 14,
  );

  const [phone, setPhone] = useState(prevMeta?.info?.phone ?? '');
  const [email, setEmail] = useState(prevMeta?.info?.email ?? '');
  const [address, setAddress] = useState(prevMeta?.info?.address ?? '');

  const [linkedContacts, setLinkedContacts] = useState<ContactLink[]>(
    prevMeta?.linkedContactRefs ?? [],
  );

  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);

  const allResources = useResourceStore((s) => s.resources);
  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const linkableContacts = Object.values(allResources).filter(
    (r) => r.type === 'contact' && r.id !== existing?.id,
  );

  function toggleGroup(g: ContactGroup) {
    setGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  function addLink() {
    setLinkedContacts((prev) => [...prev, { contactId: '', relationship: '' }]);
  }

  function removeLink(i: number) {
    setLinkedContacts((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateLink(i: number, field: keyof ContactLink, value: string) {
    setLinkedContacts((prev) =>
      prev.map((link, idx) => (idx === i ? { ...link, [field]: value } : link)),
    );
  }

  const canSave = displayName.trim().length > 0;

  function handleSave() {
    if (!canSave) return;

    const validLinks = linkedContacts.filter((l) => l.contactId.trim() !== '');

    const meta: ContactMeta = {
      info: {
        birthday: birthday || undefined,
        phone: phone || undefined,
        email: email || undefined,
        address: address || undefined,
      },
      customTag: prevMeta?.customTag ?? null,
      groups: groups.length > 0 ? groups : undefined,
      notes,
      linkedContactRefs: validLinks.length > 0 ? validLinks : undefined,
      birthdayLeadDays: birthday ? birthdayLeadDays : undefined,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
      description: existing?.description ?? '',
      type: 'contact',
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
          contacts: user.resources.contacts.includes(resource.id)
            ? user.resources.contacts
            : [...user.resources.contacts, resource.id],
        },
      };
      setUser(updatedUser);
    }

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

        {/* Row 1: Icon + Name */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <IconPicker value={iconKey} onChange={setIconKey} />
          <TextInput
            label="Name *"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Full name"
            maxLength={100}
          />
        </div>

        {/* Row 2: Group toggle pills */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Groups</label>
          <div className="flex flex-wrap gap-1.5">
            {CONTACT_GROUPS.map((g) => {
              const selected = groups.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGroup(g)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors capitalize ${
                    selected
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-500'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Birthday + Reminder (2-col) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Birthday</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Reminder
            </label>
            <select
              value={birthday ? birthdayLeadDays : ''}
              disabled={!birthday}
              onChange={(e) => setBirthdayLeadDays(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-40"
            >
              <option value={-1}>Never</option>
              <option value={0}>Day of</option>
              <option value={3}>3 days before</option>
              <option value={7}>7 days before</option>
              <option value={14}>14 days before</option>
              <option value={30}>30 days before</option>
            </select>
          </div>
        </div>

        {/* Row 4: Phone + Email (2-col) */}
        <div className="grid grid-cols-2 gap-3">
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
        </div>

        {/* Row 5: Address */}
        <TextInput
          label="Address"
          value={address}
          onChange={setAddress}
          placeholder="123 Main St"
          maxLength={200}
        />

        {/* Row 6: Linked contacts table */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Linked contacts
          </label>
          {linkedContacts.length > 0 && (
            <div className="rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-700/60 text-xs text-gray-400 dark:text-gray-500">
                <span>Contact</span>
                <span>Relationship</span>
                <span className="w-5" />
              </div>
              {/* Rows */}
              {linkedContacts.map((link, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2 px-2 py-1.5 border-t border-gray-100 dark:border-gray-700 items-center"
                >
                  <select
                    value={link.contactId}
                    onChange={(e) => updateLink(i, 'contactId', e.target.value)}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">— select —</option>
                    {linkableContacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={link.relationship}
                    onChange={(e) => updateLink(i, 'relationship', e.target.value)}
                    placeholder="e.g. partner"
                    maxLength={60}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeLink(i)}
                    aria-label="Remove link"
                    className="w-5 text-center text-gray-400 hover:text-red-500 transition-colors leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-blue-500 hover:text-blue-600 text-left"
          >
            + Add link
          </button>
        </div>

        {/* Notes log */}
        <NotesLogEditor notes={notes} onChange={setNotes} />

      </div>
    </div>
  );
}
