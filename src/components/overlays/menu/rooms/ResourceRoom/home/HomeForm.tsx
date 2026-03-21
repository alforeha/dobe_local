// ─────────────────────────────────────────
// HomeForm — add / edit form for Home resources. W23.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, HomeMeta, HomeRoom } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { storageSet, storageKey } from '../../../../../../storage';
import { generateScheduledTasks } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';

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
  name: string;
  icon: string;
}

export function HomeForm({ existing, onSaved, onCancel }: HomeFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [address, setAddress] = useState(prevMeta?.address ?? '');
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');
  const [rooms, setRooms] = useState<RoomDraft[]>(
    prevMeta?.rooms.map((r) => ({ id: r.id, name: r.name, icon: r.icon ?? '' })) ?? [],
  );

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0 && address.trim().length > 0;

  function addRoom() {
    setRooms((prev) => [...prev, { id: uuidv4(), name: '', icon: '' }]);
  }

  function updateRoom(id: string, field: 'name' | 'icon', value: string) {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSave() {
    if (!canSave) return;

    const finalRooms: HomeRoom[] = rooms
      .filter((r) => r.name.trim().length > 0)
      .map((r) => {
        const prev = prevMeta?.rooms.find((pr) => pr.id === r.id);
        return {
          id: r.id,
          name: r.name.trim(),
          icon: r.icon.trim() || null,
          assignedTo: prev?.assignedTo ?? [],
          linkedDocs: prev?.linkedDocs ?? [],
          linkedLayoutRef: prev?.linkedLayoutRef ?? null,
        };
      });

    const meta: HomeMeta = {
      memberContactRefs: prevMeta?.memberContactRefs ?? [],
      rooms: finalRooms,
      linkedInventoryRef: prevMeta?.linkedInventoryRef ?? null,
      linkedDocs: prevMeta?.linkedDocs ?? [],
      recurringTasksStub: null,
      address: address.trim(),
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '🏠',
      description: existing?.description ?? '',
      type: 'home',
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
          homes: user.resources.homes.includes(resource.id)
            ? user.resources.homes
            : [...user.resources.homes, resource.id],
        },
      };
      setUser(updatedUser);
      storageSet('user', updatedUser);
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
        <TextInput
          label="Name *"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Main Home"
          maxLength={100}
        />
        <TextInput
          label="Address *"
          value={address}
          onChange={setAddress}
          placeholder="123 Main St"
          maxLength={200}
        />

        {/* Rooms */}
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
              className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2"
            >
              <input
                type="text"
                value={room.icon}
                onChange={(e) => updateRoom(room.id, 'icon', e.target.value)}
                placeholder="🛏"
                maxLength={4}
                className="w-10 text-center rounded border border-gray-200 dark:border-gray-600 px-1 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
              />
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                placeholder="Room name"
                maxLength={60}
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeRoom(room.id)}
                className="text-gray-400 hover:text-red-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this home…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
