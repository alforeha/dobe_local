// ─────────────────────────────────────────
// VehicleForm — add / edit form for Vehicle resources. W24.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Resource, VehicleMeta } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';
import { storageSet, storageKey } from '../../../../../../storage';
import { generateScheduledTasks, generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { NumberInput } from '../../../../../shared/inputs/NumberInput';

interface VehicleFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): VehicleMeta | null {
  if (!r || r.type !== 'vehicle') return null;
  return r.meta as VehicleMeta;
}

export function VehicleForm({ existing, onSaved, onCancel }: VehicleFormProps) {
  const prevMeta = existingMeta(existing);

  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [make, setMake] = useState(prevMeta?.make ?? '');
  const [model, setModel] = useState(prevMeta?.model ?? '');
  const [year, setYear] = useState<number | ''>(prevMeta?.year ?? '');
  const [mileage, setMileage] = useState<number | ''>(prevMeta?.mileage ?? '');
  const [licensePlate, setLicensePlate] = useState(prevMeta?.licensePlate ?? '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(prevMeta?.insuranceExpiry ?? '');
  const [serviceNextDate, setServiceNextDate] = useState(prevMeta?.serviceNextDate ?? '');
  const [notes, setNotes] = useState(prevMeta?.notes ?? '');

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0 && make.trim().length > 0 && model.trim().length > 0;

  function handleSave() {
    if (!canSave) return;

    const meta: VehicleMeta = {
      make: make.trim(),
      model: model.trim(),
      year: year === '' ? null : year,
      mileage: mileage === '' ? null : mileage,
      memberContactRefs: prevMeta?.memberContactRefs ?? [],
      linkedDocs: prevMeta?.linkedDocs ?? [],
      recurringTasksStub: null,
      licensePlate: licensePlate.trim() || null,
      insuranceExpiry: insuranceExpiry || null,
      serviceNextDate: serviceNextDate || null,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: existing?.icon ?? '🚗',
      description: existing?.description ?? '',
      type: 'vehicle',
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
          vehicles: user.resources.vehicles.includes(resource.id)
            ? user.resources.vehicles
            : [...user.resources.vehicles, resource.id],
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
          {existing ? 'Edit Vehicle' : 'New Vehicle'}
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
          placeholder="e.g. Family Car"
          maxLength={100}
        />
        <TextInput
          label="Make *"
          value={make}
          onChange={setMake}
          placeholder="e.g. Toyota"
          maxLength={80}
        />
        <TextInput
          label="Model *"
          value={model}
          onChange={setModel}
          placeholder="e.g. Camry"
          maxLength={80}
        />
        <NumberInput
          label="Year"
          value={year}
          onChange={setYear}
          placeholder="e.g. 2020"
          min={1900}
          max={2100}
        />
        <NumberInput
          label="Mileage (odometer)"
          value={mileage}
          onChange={setMileage}
          placeholder="e.g. 45000"
          min={0}
        />
        <TextInput
          label="License Plate"
          value={licensePlate}
          onChange={setLicensePlate}
          placeholder="e.g. ABC-1234"
          maxLength={20}
        />

        {/* Insurance expiry */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Insurance Expiry
          </label>
          <input
            type="date"
            value={insuranceExpiry}
            onChange={(e) => setInsuranceExpiry(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400">GTD task fires when within 30 days.</p>
        </div>

        {/* Service due date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Service Next Date
          </label>
          <input
            type="date"
            value={serviceNextDate}
            onChange={(e) => setServiceNextDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-400">GTD task fires when within 14 days.</p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this vehicle…"
            rows={4}
            maxLength={1000}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 dark:bg-gray-700 dark:border-gray-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
