import { useState } from 'react';
import { TabButton } from '../../../../shared/buttons/TabButton';
import { AvatarEquipView } from './AvatarEquipView';
import { InventoryListView } from './InventoryListView';

type EquipTab = 'equip' | 'inventory';

export function EquipmentRoom() {
  const [tab, setTab] = useState<EquipTab>('equip');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-bold text-gray-700 mb-2">Equipment</h3>
        <div className="flex gap-1">
          <TabButton label="Avatar Equip" active={tab === 'equip'} onClick={() => setTab('equip')} />
          <TabButton label="Inventory" active={tab === 'inventory'} onClick={() => setTab('inventory')} />
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        {tab === 'equip' ? <AvatarEquipView /> : <InventoryListView />}
      </div>
    </div>
  );
}
