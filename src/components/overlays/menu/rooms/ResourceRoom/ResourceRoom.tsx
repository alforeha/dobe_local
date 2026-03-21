import { useState } from 'react';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import type { Resource, ResourceType } from '../../../../../types/resource';
import { ResourceRoomHeader } from './ResourceRoomHeader';
import { ResourceRoomSubHeader } from './ResourceRoomSubHeader';
import { ResourceRoomBody } from './ResourceRoomBody';
import { TypeSelectorSheet } from './TypeSelectorSheet';
import { ContactForm } from './contact/ContactForm';

type AddStep = 'closed' | 'type-selector' | 'contact-form';

export function ResourceRoom() {
  const [activeType, setActiveType] = useState<ResourceType>('contact');
  const [addStep, setAddStep] = useState<AddStep>('closed');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const resources = useResourceStore((s) => s.resources);
  const filtered = Object.values(resources).filter((r) => r.type === activeType);

  // ── Edit overlay ──────────────────────────────────────────────────────────
  if (editingResource) {
    return (
      <div className="flex flex-col h-full">
        <ContactForm
          existing={editingResource}
          onSaved={() => setEditingResource(null)}
          onCancel={() => setEditingResource(null)}
        />
      </div>
    );
  }

  // ── Add flow: type selector ───────────────────────────────────────────────
  if (addStep === 'type-selector') {
    return (
      <div className="flex flex-col h-full">
        <TypeSelectorSheet
          onSelect={(type) => {
            if (type === 'contact') {
              setAddStep('contact-form');
            } else {
              // Other types not yet implemented in W22
              setAddStep('closed');
            }
          }}
          onCancel={() => setAddStep('closed')}
        />
      </div>
    );
  }

  // ── Add flow: contact form ─────────────────────────────────────────────────
  if (addStep === 'contact-form') {
    return (
      <div className="flex flex-col h-full">
        <ContactForm
          onSaved={() => setAddStep('closed')}
          onCancel={() => setAddStep('type-selector')}
        />
      </div>
    );
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
