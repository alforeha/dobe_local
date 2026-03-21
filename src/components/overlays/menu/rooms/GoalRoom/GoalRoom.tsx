import { useState } from 'react';
import { useProgressionStore } from '../../../../../stores/useProgressionStore';
import { useUserStore } from '../../../../../stores/useUserStore';
import { GoalRoomHeader } from './GoalRoomHeader';
import { GoalRoomBody } from './GoalRoomBody';

type GoalTab = 'habitats' | 'adventures';

export function GoalRoom() {
  const [tab, setTab] = useState<GoalTab>('habitats');
  const acts = useProgressionStore((s) => s.acts);
  const user = useUserStore((s) => s.user);

  const refs =
    tab === 'habitats'
      ? (user?.goals.habitats ?? [])
      : (user?.goals.adventures ?? []);

  const filteredActs = refs.map((id) => acts[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <GoalRoomHeader activeTab={tab} onTabChange={setTab} />
      <GoalRoomBody acts={filteredActs} />
    </div>
  );
}
