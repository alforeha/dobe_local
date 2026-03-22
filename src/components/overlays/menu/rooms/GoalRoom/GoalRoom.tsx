import { useState } from 'react';
import { useProgressionStore } from '../../../../../stores/useProgressionStore';
import { GoalRoomHeader } from './GoalRoomHeader';
import { GoalRoomBody } from './GoalRoomBody';
import { ActPopup } from './ActPopup';
import type { Act, ActHabitat } from '../../../../../types';

type GoalTab = 'habitats' | 'adventures';

export function GoalRoom() {
  const [tab, setTab] = useState<GoalTab>('habitats');
  const [addOpen, setAddOpen] = useState(false);
  const [editAct, setEditAct] = useState<Act | null>(null);

  const acts = useProgressionStore((s) => s.acts);

  const filteredActs = Object.values(acts).filter(
    (act) => (act.habitat ?? 'habitats') === tab,
  );

  function handleClosePopup() {
    setAddOpen(false);
    setEditAct(null);
  }

  const popupOpen = addOpen || editAct !== null;
  const popupAct = editAct;
  const defaultHabitat: ActHabitat = tab;

  return (
    <div className="flex flex-col h-full">
      <GoalRoomHeader activeTab={tab} onTabChange={setTab} onAdd={() => setAddOpen(true)} />
      <GoalRoomBody acts={filteredActs} onEdit={(act) => setEditAct(act)} />
      {popupOpen && (
        <ActPopup
          editAct={popupAct}
          defaultHabitat={defaultHabitat}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
