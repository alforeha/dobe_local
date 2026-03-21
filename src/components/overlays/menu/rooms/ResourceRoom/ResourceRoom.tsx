import { useState } from 'react';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import type { Resource, ResourceType } from '../../../../../types/resource';
import { ResourceRoomHeader } from './ResourceRoomHeader';
import { ResourceRoomSubHeader } from './ResourceRoomSubHeader';
import { ResourceRoomBody } from './ResourceRoomBody';
import { TypeSelectorSheet } from './TypeSelectorSheet';
import { ContactForm } from './contact/ContactForm';
import { HomeForm } from './home/HomeForm';
import { VehicleForm } from './vehicle/VehicleForm';
import { AccountForm } from './account/AccountForm';
import { InventoryForm } from './inventory/InventoryForm';
import { DocForm } from './doc/DocForm';

type AddStep =
  | 'closed'
  | 'type-selector'
  | 'contact-form'
  | 'home-form'
  | 'vehicle-form'
  | 'account-form'
  | 'inventory-form'
  | 'doc-form';

const TYPE_TO_ADD_STEP: Record<ResourceType, AddStep> = {
  contact:   'contact-form',
  home:      'home-form',
  vehicle:   'vehicle-form',
  account:   'account-form',
  inventory: 'inventory-form',
  doc:       'doc-form',
};

export function ResourceRoom() {
  const [activeType, setActiveType] = useState<ResourceType>('contact');
  const [addStep, setAddStep] = useState<AddStep>('closed');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const resources = useResourceStore((s) => s.resources);
  const filtered = Object.values(resources).filter((r) => r.type === activeType);

  // ── Edit overlay ──────────────────────────────────────────────────────────
  if (editingResource) {
    const onDone = () => setEditingResource(null);
    return (
      <div className="flex flex-col h-full">
        {editingResource.type === 'home'      && <HomeForm      existing={editingResource} onSaved={onDone} onCancel={onDone} />}
        {editingResource.type === 'vehicle'   && <VehicleForm   existing={editingResource} onSaved={onDone} onCancel={onDone} />}
        {editingResource.type === 'account'   && <AccountForm   existing={editingResource} onSaved={onDone} onCancel={onDone} />}
        {editingResource.type === 'inventory' && <InventoryForm existing={editingResource} onSaved={onDone} onCancel={onDone} />}
        {editingResource.type === 'doc'       && <DocForm       existing={editingResource} onSaved={onDone} onCancel={onDone} />}
        {editingResource.type === 'contact'   && <ContactForm   existing={editingResource} onSaved={onDone} onCancel={onDone} />}
      </div>
    );
  }

  // ── Add flow: type selector ───────────────────────────────────────────────
  if (addStep === 'type-selector') {
    return (
      <div className="flex flex-col h-full">
        <TypeSelectorSheet
          onSelect={(type) => setAddStep(TYPE_TO_ADD_STEP[type])}
          onCancel={() => setAddStep('closed')}
        />
      </div>
    );
  }

  // ── Add flow: individual forms ─────────────────────────────────────────────
  const backToSelector = () => setAddStep('type-selector');
  const onAdded = () => setAddStep('closed');

  if (addStep === 'contact-form') {
    return <div className="flex flex-col h-full"><ContactForm   onSaved={onAdded} onCancel={backToSelector} /></div>;
  }
  if (addStep === 'home-form') {
    return <div className="flex flex-col h-full"><HomeForm      onSaved={onAdded} onCancel={backToSelector} /></div>;
  }
  if (addStep === 'vehicle-form') {
    return <div className="flex flex-col h-full"><VehicleForm   onSaved={onAdded} onCancel={backToSelector} /></div>;
  }
  if (addStep === 'account-form') {
    return <div className="flex flex-col h-full"><AccountForm   onSaved={onAdded} onCancel={backToSelector} /></div>;
  }
  if (addStep === 'inventory-form') {
    return <div className="flex flex-col h-full"><InventoryForm onSaved={onAdded} onCancel={backToSelector} /></div>;
  }
  if (addStep === 'doc-form') {
    return <div className="flex flex-col h-full"><DocForm       onSaved={onAdded} onCancel={backToSelector} /></div>;
  }

  // ── Normal room view ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      <ResourceRoomHeader
        activeType={activeType}
        onTypeChange={(t) => {
          setActiveType(t);
          setAddStep('closed');
        }}
      />
      <ResourceRoomSubHeader type={activeType} onAdd={() => setAddStep('type-selector')} />
      <ResourceRoomBody resources={filtered} onEdit={setEditingResource} />
    </div>
  );
}

