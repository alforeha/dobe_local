import { useState } from 'react';
import { useProgressionStore } from '../../../../../stores/useProgressionStore';
import { GoalRoomHeader } from './GoalRoomHeader';
import { GoalRoomBody } from './GoalRoomBody';
import { ActPopup } from './ActPopup';
import { ChooseYourPath } from './ChooseYourPath';
import { STARTER_ACT_IDS } from '../../../../../coach/StarterQuestLibrary';
import type { Act } from '../../../../../types';

type HabitatFilter = 'habitats' | 'adventures';

export function GoalRoom() {
  const [habitatFilter, setHabitatFilter] = useState<Set<HabitatFilter>>(
    new Set(['habitats', 'adventures']),
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editAct, setEditAct] = useState<Act | null>(null);

  const acts = useProgressionStore((s) => s.acts);

  const filteredActs = Object.values(acts).filter((act) => {
    const h = (act.habitat ?? 'habitats') as HabitatFilter;
    return habitatFilter.has(h);
  });

  function toggleFilter(h: HabitatFilter) {
    setHabitatFilter((prev) => {
      const next = new Set(prev);
      if (next.has(h)) {
        if (next.size === 1) return prev; // prevent both off
        next.delete(h);
      } else {
        next.add(h);
      }
      return next;
    });
  }

  function handleClosePopup() {
    setAddOpen(false);
    setEditAct(null);
  }

  const popupOpen = addOpen || editAct !== null;
  const popupAct = editAct;

  // Show Choose Your Path section when Daily Adventure is unlocked (D87)
  const showChooseYourPath = habitatFilter.has('adventures') && !!acts[STARTER_ACT_IDS.daily];

  return (
    <div className="flex flex-col h-full">
      <GoalRoomHeader
        habitatFilter={habitatFilter}
        onToggleFilter={toggleFilter}
        onAdd={() => setAddOpen(true)}
      />
      <GoalRoomBody acts={filteredActs} onEdit={(act) => setEditAct(act)} />
      {showChooseYourPath && <ChooseYourPath />}
      {popupOpen && (
        <ActPopup
          editAct={popupAct}
          defaultHabitat="habitats"
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
