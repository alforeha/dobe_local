import type { Resource } from '../../../../../types/resource';
import { ResourceBlock } from './ResourceBlock';

interface ResourceRoomBodyProps {
  resources: Resource[];
}

export function ResourceRoomBody({ resources }: ResourceRoomBodyProps) {
  if (resources.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-10">No resources here yet.</p>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
      {resources.map((r) => (
        <ResourceBlock key={r.id} resource={r} />
      ))}
    </div>
  );
}
