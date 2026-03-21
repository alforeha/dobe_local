import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { ScheduleRoomHeader } from './ScheduleRoomHeader';
import { ScheduleRoomSubHeader } from './ScheduleRoomSubHeader';
import { ScheduleRoomBody } from './ScheduleRoomBody';
import { LeaguesTabStub } from './LeaguesTabStub';
import { RoutinePopup } from './RoutinePopup';
import type { PlannedEvent } from '../../../../../types';

type ScheduleTab = 'routines' | 'leagues';

type PopupState =
  | { mode: 'add' }
  | { mode: 'edit'; routine: PlannedEvent }
  | null;

export function ScheduleRoom() {
  const [tab, setTab] = useState<ScheduleTab>('routines');
  const [filter, setFilter] = useState('');
  const [popup, setPopup] = useState<PopupState>(null);
  const plannedEvents = useScheduleStore((s) => s.plannedEvents);

  const allEvents = Object.values(plannedEvents);
  const filtered = filter
    ? allEvents.filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
    : allEvents;

  function handleEdit(routine: PlannedEvent) {
    setPopup({ mode: 'edit', routine });
  }

  return (
    <div className="flex flex-col h-full">
      <ScheduleRoomHeader activeTab={tab} onTabChange={setTab} />
      {tab === 'routines' && (
        <>
          <ScheduleRoomSubHeader
            filterValue={filter}
            onFilterChange={setFilter}
            onAdd={() => setPopup({ mode: 'add' })}
          />
          <ScheduleRoomBody events={filtered} onEdit={handleEdit} />
        </>
      )}
      {tab === 'leagues' && <LeaguesTabStub />}
      {popup && (
        <RoutinePopup
          editRoutine={popup.mode === 'edit' ? popup.routine : null}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
