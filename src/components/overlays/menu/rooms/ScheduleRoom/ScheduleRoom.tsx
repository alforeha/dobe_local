import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { ScheduleRoomHeader } from './ScheduleRoomHeader';
import { ScheduleRoomSubHeader } from './ScheduleRoomSubHeader';
import { ScheduleRoomBody } from './ScheduleRoomBody';
import { LeaguesTabStub } from './LeaguesTabStub';
import { RoutinePopup } from './RoutinePopup';
import { OneOffEventPopup } from './OneOffEventPopup';
import { isOneOffEvent } from '../../../../../utils/isOneOffEvent';
import type { PlannedEvent } from '../../../../../types';

type ScheduleTab = 'routines' | 'leagues';

type PopupState =
  | { mode: 'add-routine' }
  | { mode: 'edit-routine'; routine: PlannedEvent }
  | { mode: 'add-event' }
  | { mode: 'edit-event'; event: PlannedEvent }
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

  function handleEdit(event: PlannedEvent) {
    if (isOneOffEvent(event)) {
      setPopup({ mode: 'edit-event', event });
    } else {
      setPopup({ mode: 'edit-routine', routine: event });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScheduleRoomHeader activeTab={tab} onTabChange={setTab} />
      {tab === 'routines' && (
        <>
          <ScheduleRoomSubHeader
            filterValue={filter}
            onFilterChange={setFilter}
            onAddRoutine={() => setPopup({ mode: 'add-routine' })}
            onAddEvent={() => setPopup({ mode: 'add-event' })}
          />
          <ScheduleRoomBody events={filtered} onEdit={handleEdit} />
        </>
      )}
      {tab === 'leagues' && <LeaguesTabStub />}

      {(popup?.mode === 'add-routine' || popup?.mode === 'edit-routine') && (
        <RoutinePopup
          editRoutine={popup.mode === 'edit-routine' ? popup.routine : null}
          onClose={() => setPopup(null)}
        />
      )}
      {(popup?.mode === 'add-event' || popup?.mode === 'edit-event') && (
        <OneOffEventPopup
          editEvent={popup.mode === 'edit-event' ? popup.event : null}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
