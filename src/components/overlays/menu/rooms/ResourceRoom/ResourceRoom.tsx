import { useState } from 'react';
import { useResourceStore } from '../../../../../stores/useResourceStore';
import type { ResourceType } from '../../../../../types/resource';
import { ResourceRoomHeader } from './ResourceRoomHeader';
import { ResourceRoomSubHeader } from './ResourceRoomSubHeader';
import { ResourceRoomBody } from './ResourceRoomBody';

export function ResourceRoom() {
  const [activeType, setActiveType] = useState<ResourceType>('contact');
  const resources = useResourceStore((s) => s.resources);

  const filtered = Object.values(resources).filter((r) => r.type === activeType);

  return (
    <div className="flex flex-col h-full">
      <ResourceRoomHeader activeType={activeType} onTypeChange={setActiveType} />
      <ResourceRoomSubHeader type={activeType} />
      <ResourceRoomBody resources={filtered} />
    </div>
  );
}
