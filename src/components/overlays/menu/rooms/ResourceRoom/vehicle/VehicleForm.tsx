// ─────────────────────────────────────────
// VehicleForm — add / edit form for Vehicle resources. W24.
// ─────────────────────────────────────────

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Resource,
  VehicleMeta,
  VehicleMaintenanceTask,
  ResourceNote,
  RecurrenceRule,
} from '../../../../../../types/resource';
import { makeDefaultRecurrenceRule, toRecurrenceRule } from '../../../../../../types/resource';
import { useResourceStore } from '../../../../../../stores/useResourceStore';
import { useUserStore } from '../../../../../../stores/useUserStore';

import { generateScheduledTasks, generateGTDItems } from '../../../../../../engine/resourceEngine';
import { TextInput } from '../../../../../shared/inputs/TextInput';
import { NumberInput } from '../../../../../shared/inputs/NumberInput';
import { IconPicker } from '../../../../../shared/IconPicker';
import { NotesLogEditor } from '../../../../../shared/NotesLogEditor';
import { RecurrenceRuleEditor } from '../../../../../shared/RecurrenceRuleEditor';

interface VehicleFormProps {
  existing?: Resource;
  onSaved: () => void;
  onCancel: () => void;
}

function existingMeta(r: Resource | undefined): VehicleMeta | null {
  if (!r || r.type !== 'vehicle') return null;
  return r.meta as VehicleMeta;
}

interface TaskDraft {
  id: string;
  icon: string;
  name: string;
  recurrence: RecurrenceRule;
  reminderLeadDays: number;
}

const SELECT_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-40';

const DATE_CLS =
  'w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500';

export function VehicleForm({ existing, onSaved, onCancel }: VehicleFormProps) {
  const prevMeta = existingMeta(existing);

  const [iconKey, setIconKey] = useState<string>(existing?.icon ?? 'vehicle');
  const [displayName, setDisplayName] = useState(existing?.name ?? '');
  const [licensePlate, setLicensePlate] = useState(prevMeta?.licensePlate ?? '');
  const [make, setMake] = useState(prevMeta?.make ?? '');
  const [model, setModel] = useState(prevMeta?.model ?? '');
  const [mileage, setMileage] = useState<number | ''>(prevMeta?.mileage ?? '');
  const [year, setYear] = useState<number | ''>(prevMeta?.year ?? '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(prevMeta?.insuranceExpiry ?? '');
  const [insuranceLeadDays, setInsuranceLeadDays] = useState<number>(
    prevMeta?.insuranceLeadDays ?? 30,
  );
  const [serviceNextDate, setServiceNextDate] = useState(prevMeta?.serviceNextDate ?? '');
  const [serviceLeadDays, setServiceLeadDays] = useState<number>(
    prevMeta?.serviceLeadDays ?? 14,
  );
  const [maintenanceTasks, setMaintenanceTasks] = useState<TaskDraft[]>(
    prevMeta?.maintenanceTasks?.map((t) => ({
      id: t.id,
      icon: t.icon ?? '',
      name: t.name,
      recurrence: toRecurrenceRule(t.recurrence),
      reminderLeadDays: t.reminderLeadDays ?? 14,
    })) ?? [],
  );
  const [notes, setNotes] = useState<ResourceNote[]>(prevMeta?.notes ?? []);

  const setResource = useResourceStore((s) => s.setResource);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);

  const canSave = displayName.trim().length > 0;

  // ── Maintenance tasks ──────────────────
  function addTask() {
    setMaintenanceTasks((prev) => [
      ...prev,
      { id: uuidv4(), icon: '', name: '', recurrence: makeDefaultRecurrenceRule(), reminderLeadDays: 14 },
    ]);
  }

  function updateTask(id: string, field: keyof TaskDraft, value: string | number | RecurrenceRule) {
    setMaintenanceTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  }

  function removeTask(id: string) {
    setMaintenanceTasks((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Save ───────────────────────────────
  function handleSave() {
    if (!canSave) return;

    const finalTasks: VehicleMaintenanceTask[] = maintenanceTasks
      .filter((t) => t.name.trim().length > 0)
      .map((t) => ({
        id: t.id,
        icon: t.icon.trim(),
        name: t.name.trim(),
        recurrence: t.recurrence,
        reminderLeadDays: t.reminderLeadDays,
      }));

    const meta: VehicleMeta = {
      make: make.trim() || null,
      model: model.trim() || null,
      year: year === '' ? null : year,
      mileage: mileage === '' ? null : mileage,
      memberContactRefs: prevMeta?.memberContactRefs ?? [],
      linkedDocs: prevMeta?.linkedDocs ?? [],
      recurringTasksStub: null,
      licensePlate: licensePlate.trim() || null,
      insuranceExpiry: insuranceExpiry || null,
      insuranceLeadDays: insuranceExpiry ? insuranceLeadDays : undefined,
      serviceNextDate: serviceNextDate || null,
      serviceLeadDays: serviceNextDate ? serviceLeadDays : undefined,
      maintenanceTasks: finalTasks.length > 0 ? finalTasks : undefined,
      notes,
    };

    const resource: Resource = {
      id: existing?.id ?? uuidv4(),
      name: displayName.trim(),
      icon: iconKey,
      description: existing?.description ?? '',
      type: 'vehicle',
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
          vehicles: user.resources.vehicles.includes(resource.id)
            ? user.resources.vehicles
            : [...user.resources.vehicles, resource.id],
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

        {/* Row 1: Icon + Name + Plate */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-end">
          <IconPicker value={iconKey} onChange={setIconKey} />
          <TextInput
            label="Name *"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Family Car"
            maxLength={100}
          />
          <TextInput
            label="Plate"
            value={licensePlate}
            onChange={setLicensePlate}
            placeholder="ABC-123"
            maxLength={20}
            className="w-24"
          />
        </div>

        {/* Row 2: Make + Model + Mileage */}
        <div className="grid grid-cols-3 gap-3">
          <TextInput
            label="Make"
            value={make}
            onChange={setMake}
            placeholder="Toyota"
            maxLength={80}
          />
          <TextInput
            label="Model"
            value={model}
            onChange={setModel}
            placeholder="Camry"
            maxLength={80}
          />
          <NumberInput
            label="Mileage"
            value={mileage}
            onChange={setMileage}
            placeholder="45000"
            min={0}
          />
        </div>

        {/* Row 3: Year */}
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Year"
            value={year}
            onChange={setYear}
            placeholder="2020"
            min={1900}
            max={2100}
          />
          <div /> {/* spacer */}
        </div>

        {/* Row 4: Insurance expiry + Reminder */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Insurance Expiry
            </label>
            <input
              type="date"
              value={insuranceExpiry}
              onChange={(e) => setInsuranceExpiry(e.target.value)}
              className={DATE_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Reminder
            </label>
            <select
              value={insuranceExpiry ? insuranceLeadDays : ''}
              disabled={!insuranceExpiry}
              onChange={(e) => setInsuranceLeadDays(Number(e.target.value))}
              className={SELECT_CLS}
            >
              <option value={-1}>Never</option>
              <option value={0}>Day of</option>
              <option value={7}>7 days before</option>
              <option value={14}>14 days before</option>
              <option value={30}>30 days before</option>
              <option value={60}>60 days before</option>
            </select>
          </div>
        </div>

        {/* Row 5: Service next date + Reminder */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Service Next Date
            </label>
            <input
              type="date"
              value={serviceNextDate}
              onChange={(e) => setServiceNextDate(e.target.value)}
              className={DATE_CLS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Reminder
            </label>
            <select
              value={serviceNextDate ? serviceLeadDays : ''}
              disabled={!serviceNextDate}
              onChange={(e) => setServiceLeadDays(Number(e.target.value))}
              className={SELECT_CLS}
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

        {/* Maintenance tasks section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Maintenance tasks
            </span>
            <button
              type="button"
              onClick={addTask}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium"
            >
              + Add task
            </button>
          </div>
          {maintenanceTasks.length === 0 && (
            <p className="text-xs text-gray-400 italic">No maintenance tasks added yet.</p>
          )}
          {maintenanceTasks.map((task) => (
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
                  placeholder="🔧"
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
                  <option value={3}>3 days before</option>
                  <option value={7}>7 days before</option>
                  <option value={14}>14 days before</option>
                  <option value={30}>30 days before</option>
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
