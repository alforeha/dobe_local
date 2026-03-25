// ─────────────────────────────────────────
// InventoryForm — add / edit form for Inventory resources. W26 / H.
// Per-item threshold replaces container-level lowStockThreshold.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, InventoryMeta, InventoryItem, ResourceNote } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateScheduledTasks, generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';

interface InventoryFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): InventoryMeta | null {
  if (!r || r.type !== 'inventory') return null;
  return r.meta as InventoryMeta;
}

interface ItemDraft {
  draftId: string;
  id: string;
  icon: string;
  name: string;
  quantity: number | '';
  unit: string;
  threshold: number | '';
  linkedResourceRef: string;
}

const INPUT_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none';

export function InventoryForm({ existing, onSaved, onCancel }: InventoryFormProps) {
  const prevMeta = existingMeta(existing);

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'admin');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(prevMeta?.category ?? '');
  const [linkedRef, setLinkedRef] = useState(prevMeta?.linkedResourceRefs?.[0] ?? '');
  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);
  const [items, setItems] = useState<ItemDraft[]>(
    prevMeta?.items.map((it) => ({
      draftId: uuidv4(),
      id: it.id,
      icon: it.icon ?? '',
      name: it.name ?? '',
      quantity: it.quantity,
      unit: it.unit ?? '',
      threshold: it.threshold ?? '',
      linkedResourceRef: it.linkedResourceRef ?? '',
    })) ?? [],
  );

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0;

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        draftId: uuidv4(),
        id: uuidv4(),
        icon: '',
        name: '',
        quantity: 1,
        unit: '',
        threshold: '',
        linkedResourceRef: '',
      },
    ]);
  }

  function updateItem(draftId: string, field: keyof ItemDraft, value: string | number | '') {
    setItems((prev) =>
      prev.map((it) => (it.draftId === draftId ? { ...it, [field]: value } : it)),
    );
  }

  function removeItem(draftId: string) {
    setItems((prev) => prev.filter((it) => it.draftId !== draftId));
  }

  function handleSave() {
    if (!canSave) return;

    const finalItems: InventoryItem[] = items
      .filter((it) => it.name.trim().length > 0)
      .map((it) => ({
        id: it.id,
        icon: it.icon.trim(),
        name: it.name.trim(),
        quantity: it.quantity === '' ? 0 : it.quantity,
        unit: it.unit.trim() || undefined,
        threshold: it.threshold === '' ? undefined : it.threshold,
        linkedResourceRef: it.linkedResourceRef.trim() || undefined,
      }));

    const meta: InventoryMeta = {
      containers: prevMeta?.containers ?? [],
      items: finalItems,
      category: category.trim() || undefined,
      linkedResourceRefs: linkedRef.trim() ? [linkedRef.trim()] : undefined,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
      description: existing?.description ?? '',
      type: 'inventory',
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
          inventory: user.resources.inventory.includes(resource.id)
            ? user.resources.inventory
            : [...user.resources.inventory, resource.id],
        },
      };
      setUser(updatedUser);
    }

    generateScheduledTasks(resource);
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
          {existing ? 'Edit Inventory' : 'New Inventory'}
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
            placeholder="e.g. Kitchen Supplies"
            maxLength={100}
          />
        </div>

        {/* Row 2: Category + Linked resource */}
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Category"
            value={category}
            onChange={setCategory}
            placeholder="e.g. Kitchen"
            maxLength={60}
          />
          <TextInput
            label="Linked resource"
            value={linkedRef}
            onChange={setLinkedRef}
            placeholder="Resource ID or name"
            maxLength={120}
          />
        </div>

        {/* Items section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Items</span>
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + Add item
            </button>
          </div>
          {items.length === 0 && (
            <p className="text-xs text-gray-400 italic">No items added yet.</p>
          )}
          {items.map((item) => (
            <div
              key={item.draftId}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 space-y-2"
            >
              {/* Icon + name + remove */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.icon}
                  onChange={(e) => updateItem(item.draftId, 'icon', e.target.value)}
                  placeholder="📦"
                  maxLength={4}
                  className="w-9 text-center rounded border border-gray-200 dark:border-gray-600 px-1 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.draftId, 'name', e.target.value)}
                  placeholder="Item name"
                  maxLength={80}
                  className={`flex-1 ${INPUT_CLS}`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.draftId)}
                  className="text-gray-400 hover:text-red-400 text-xs leading-none shrink-0"
                >
                  ✕
                </button>
              </div>
              {/* Count + unit + threshold */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Count</span>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.draftId,
                        'quantity',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    min={0}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Unit</span>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(item.draftId, 'unit', e.target.value)}
                    placeholder="kg, L…"
                    maxLength={20}
                    className={INPUT_CLS}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Low at</span>
                  <input
                    type="number"
                    value={item.threshold}
                    onChange={(e) =>
                      updateItem(
                        item.draftId,
                        'threshold',
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    min={0}
                    placeholder="—"
                    className={INPUT_CLS}
                  />
                </div>
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
