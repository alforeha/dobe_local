import { useState } from 'react';
import { useScheduleStore } from '../../../../../stores/useScheduleStore';
import { ScheduleRoomHeader } from './ScheduleRoomHeader';
import { ScheduleRoomSubHeader } from './ScheduleRoomSubHeader';
import { ScheduleRoomBody } from './ScheduleRoomBody';
import { LeaguesTabStub } from './LeaguesTabStub';

type ScheduleTab = 'routines' | 'leagues';

export function ScheduleRoom() {
  const [tab, setTab] = useState<ScheduleTab>('routines');
  const [filter, setFilter] = useState('');
  const plannedEvents = useScheduleStore((s) => s.plannedEvents);

  const allEvents = Object.values(plannedEvents);
  const filtered = filter
    ? allEvents.filter((e) => e.name.toLowerCase().includes(filter.toLowerCase()))
    : allEvents;

  return (
    <div className="flex flex-col h-full">
      <ScheduleRoomHeader activeTab={tab} onTabChange={setTab} />
      {tab === 'routines' && (
        <>
          <ScheduleRoomSubHeader filterValue={filter} onFilterChange={setFilter} />
          <ScheduleRoomBody events={filtered} />
        </>
      )}
      {tab === 'leagues' && <LeaguesTabStub />}
    </div>
  );
}
