// ─────────────────────────────────────────
// InventoryForm — add / edit form for Inventory resources. W26.
// Items use name field (LOCAL v1 — no Useable store lookup).
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, InventoryMeta, InventoryItem } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { storageSet, storageKey } from '../../../../../../storage';
import { generateScheduledTasks, generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { NumberInput } from '../../../../../shared/inputs/NumberInput';

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
  id: string; // local draft id
  useableRef: string;
  name: string;
  quantity: number | '';
  unit: string;
  linkedResourceRef: string;
}

export function InventoryForm({ existing, onSaved, onCancel }: InventoryFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(prevMeta?.category ?? '');
  const [lowStockThreshold, setLowStockThreshold] = useState<number | ''>(
    prevMeta?.lowStockThreshold ?? '',
  );
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');
  const [items, setItems] = useState<ItemDraft[]>(
    prevMeta?.items.map((it) => ({
      id: uuidv4(),
      useableRef: it.useableRef,
      name: it.name ?? '',
      quantity: it.quantity,
      unit: it.unit ?? '',
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
      { id: uuidv4(), useableRef: uuidv4(), name: '', quantity: 1, unit: '', linkedResourceRef: '' },
    ]);
  }

  function updateItem(id: string, field: keyof ItemDraft, value: string | number | '') {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleSave() {
    if (!canSave) return;

    const finalItems: InventoryItem[] = items
      .filter((it) => it.name.trim().length > 0)
      .map((it) => ({
        useableRef: it.useableRef,
        containerId: null,
        quantity: it.quantity === '' ? 0 : it.quantity,
        name: it.name.trim(),
        unit: it.unit.trim() || null,
        linkedResourceRef: it.linkedResourceRef.trim() || null,
      }));

    const meta: InventoryMeta = {
      containers: prevMeta?.containers ?? [],
      items: finalItems,
      category: category.trim() || undefined,
      lowStockThreshold: lowStockThreshold === '' ? null : lowStockThreshold,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '📦',
      description: existing?.description ?? '',
      type: 'inventory',
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
          inventory: user.resources.inventory.includes(resource.id)
            ? user.resources.inventory
            : [...user.resources.inventory, resource.id],
        },
      };
      setUser(updatedUser);
      storageSet('user', updatedUser);
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
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <TextInput
          label="Name *"
          value={displayName}
          onChange={setDisplayName}
          placeholder="e.g. Kitchen Supplies"
          maxLength={100}
        />
        <TextInput
          label="Category"
          value={category}
          onChange={setCategory}
          placeholder="e.g. Kitchen, Tools"
          maxLength={60}
        />
        <NumberInput
          label="Low Stock Threshold"
          value={lowStockThreshold}
          onChange={setLowStockThreshold}
          placeholder="e.g. 2"
          min={0}
        />
        <p className="text-xs text-gray-400 -mt-2">
          Items at or below this quantity trigger a GTD task.
        </p>

        {/* Items */}
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
              key={item.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  placeholder="Item name"
                  maxLength={80}
                  className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-400 text-xs font-bold shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs text-gray-400">Qty</span>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))
                    }
                    min={0}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs text-gray-400">Unit</span>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    placeholder="kg, units…"
                    maxLength={20}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this inventory…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
