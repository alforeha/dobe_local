// ─────────────────────────────────────────
// HomeForm — add / edit form for Home resources. W23.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, HomeMeta, HomeRoom, HomeChore, ResourceNote, ResourceRecurrenceRule } from '../../../../../../types/resource';
import { makeDefaultRecurrenceRule, toRecurrenceRule } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateScheduledTasks } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';
import { RecurrenceRuleEditor } from '../../../../../shared/RecurrenceRuleEditor';

interface HomeFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): HomeMeta | null {
  if (!r || r.type !== 'home') return null;
  return r.meta as HomeMeta;
}

interface RoomDraft {
  id: string;
  icon: string;
  name: string;
  assignedTo: string[];
}

interface ChoreDraft {
  id: string;
  icon: string;
  name: string;
  recurrence: ResourceRecurrenceRule;
  assignedTo: string;
}

export function HomeForm({ existing, onSaved, onCancel }: HomeFormProps) {
  const prevMeta = existingMeta(existing);

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'home');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [address, setAddress] = useState(prevMeta?.address ?? '');
  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);

  const [rooms, setRooms] = useState<RoomDraft[]>(
    prevMeta?.rooms?.map((r) => ({
      id: r.id,
      icon: r.icon ?? '',
      name: r.name,
      assignedTo: r.assignedTo ?? [],
    })) ?? [],
  );

  const [chores, setChores] = useState<ChoreDraft[]>(
    prevMeta?.chores?.map((c) => ({
      id: c.id,
      icon: c.icon ?? '',
      name: c.name,
      recurrence: toRecurrenceRule(c.recurrence),
      assignedTo: c.assignedTo ?? 'all',
    })) ?? [],
  );

  const [members, setMembers] = useState<string[]>(prevMeta?.members ?? []);

  const allResources = useResourceStore((s) => s.resources);
  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const allContacts = Object.values(allResources).filter((r) => r.type === 'contact');
  // Contacts currently selected as home members — used for room/chore assigned-to
  const memberContacts = allContacts.filter((c) => members.includes(c.id));

  const canSave = displayName.trim().length > 0;

  // ── Members ────────────────────────────
  function toggleMember(contactId: string) {
    setMembers((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  }

  // ── Rooms ──────────────────────────────
  function addRoom() {
    setRooms((prev) => [...prev, { id: uuidv4(), icon: '', name: '', assignedTo: [] }]);
  }

  function updateRoom(id: string, field: 'name' | 'icon', value: string) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  function toggleRoomMember(roomId: string, contactId: string) {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id !== roomId) return r;
        const already = r.assignedTo.includes(contactId);
        return {
          ...r,
          assignedTo: already
            ? r.assignedTo.filter((id) => id !== contactId)
            : [...r.assignedTo, contactId],
        };
      }),
    );
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  // ── Chores ─────────────────────────────
  function addChore() {
    setChores((prev) => [
      ...prev,
      { id: uuidv4(), icon: '', name: '', recurrence: makeDefaultRecurrenceRule(), assignedTo: 'all' },
    ]);
  }

  function updateChore(id: string, field: keyof ChoreDraft, value: string | ResourceRecurrenceRule) {
    setChores((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function removeChore(id: string) {
    setChores((prev) => prev.filter((c) => c.id !== id));
  }

  // ── Save ───────────────────────────────
  function handleSave() {
    if (!canSave) return;

    const finalRooms: HomeRoom[] = rooms
      .filter((r) => r.name.trim().length > 0)
      .map((r) => ({
        id: r.id,
        icon: r.icon.trim(),
        name: r.name.trim(),
        assignedTo: r.assignedTo,
      }));

    const finalChores: HomeChore[] = chores
      .filter((c) => c.name.trim().length > 0)
      .map((c) => ({
        id: c.id,
        icon: c.icon.trim(),
        name: c.name.trim(),
        recurrence: c.recurrence,
        assignedTo: c.assignedTo,
      }));

    const meta: HomeMeta = {
      members: members.length > 0 ? members : undefined,
      rooms: finalRooms.length > 0 ? finalRooms : undefined,
      chores: finalChores.length > 0 ? finalChores : undefined,
      linkedInventoryRef: prevMeta?.linkedInventoryRef ?? null,
      linkedDocs: prevMeta?.linkedDocs ?? [],
      recurringTasksStub: null,
      address: address.trim() || undefined,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
      description: existing?.description ?? '',
      type: 'home',
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
          homes: user.resources.homes.includes(resource.id)
            ? user.resources.homes
            : [...user.resources.homes, resource.id],
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
          {existing ? 'Edit Home' : 'New Home'}
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
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">

        {/* Row 1: Icon + Name */}
        <div className="grid grid-cols-[auto_1fr] gap-3 items-end">
          <IconPicker value={iconKey} onChange={setIconKey} />
          <TextInput
            label="Name *"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Main Home"
            maxLength={100}
          />
        </div>

        {/* Row 2: Address */}
        <TextInput
          label="Address"
          value={address}
          onChange={setAddress}
          placeholder="123 Main St"
          maxLength={200}
        />

        {/* Members section */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Members</label>
          {allContacts.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No contacts added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {allContacts.map((c) => {
                const selected = members.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleMember(c.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      selected
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-green-400 hover:text-green-600'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rooms section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Rooms</span>
            <button
              type="button"
              onClick={addRoom}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + Add room
            </button>
          </div>
          {rooms.length === 0 && (
            <p className="text-xs text-gray-400 italic">No rooms added yet.</p>
          )}
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              {/* Icon + name + remove */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={room.icon}
                  onChange={(e) => updateRoom(room.id, 'icon', e.target.value)}
                  placeholder="🛏"
                  maxLength={4}
                  className="w-9 text-center rounded border border-gray-200 dark:border-gray-600 px-1 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={room.name}
                  onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                  placeholder="Room name"
                  maxLength={60}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeRoom(room.id)}
                  className="text-gray-400 hover:text-red-400 text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              {/* Assigned to: member pills */}
              <div className="flex items-start gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">Assigned:</span>
                {memberContacts.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">Add members above</span>
                ) : (
                  memberContacts.map((c) => {
                    const on = room.assignedTo.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleRoomMember(room.id, c.id)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          on
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-500 hover:border-green-400'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chores section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Chores</span>
            <button
              type="button"
              onClick={addChore}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + Add chore
            </button>
          </div>
          {chores.length === 0 && (
            <p className="text-xs text-gray-400 italic">No chores added yet.</p>
          )}
          {chores.map((chore) => (
            <div
              key={chore.id}
              className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              {/* Icon + name + remove */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chore.icon}
                  onChange={(e) => updateChore(chore.id, 'icon', e.target.value)}
                  placeholder="🧹"
                  maxLength={4}
                  className="w-9 text-center rounded border border-gray-200 dark:border-gray-600 px-1 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={chore.name}
                  onChange={(e) => updateChore(chore.id, 'name', e.target.value)}
                  placeholder="Chore name"
                  maxLength={60}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeChore(chore.id)}
                  className="text-gray-400 hover:text-red-400 text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              {/* Recurrence rule editor */}
              <RecurrenceRuleEditor
                value={chore.recurrence}
                onChange={(rule) => updateChore(chore.id, 'recurrence', rule)}
              />
              {/* Assigned to */}
              <div className="flex items-center gap-2">
                <select
                  value={chore.assignedTo}
                  disabled={memberContacts.length === 0}
                  onChange={(e) => updateChore(chore.id, 'assignedTo', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none disabled:opacity-40"
                >
                  {memberContacts.length === 0 ? (
                    <option value="all">Add members above</option>
                  ) : (
                    <>
                      <option value="all">All members</option>
                      {memberContacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* Notes log */}
        <NotesLogEditor notes={notes} onChange={setNotes} />
      </div>
    </div>
  );
}
