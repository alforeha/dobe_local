import { useState } from 'react';
import { Header } from './Header';
import { Body } from './Body';
import { Footer } from './Footer';
import { EventOverlay } from '../overlays/event/EventOverlay';
import { CoachOverlay } from '../overlays/coach/CoachOverlay';
import { ProfileOverlay } from '../overlays/profile/ProfileOverlay';
import { MenuOverlay } from '../overlays/menu/MenuOverlay';
import type { TimeView } from '../timeViews/TimeViewContainer';

export type ActiveOverlay = 'event' | 'coach' | 'profile' | 'menu' | null;

export function AppShell() {
  const [activeView, setActiveView] = useState<TimeView>('day');
  const [overlay, setOverlay] = useState<ActiveOverlay>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const openEventOverlay = (eventId: string) => {
    setSelectedEventId(eventId);
    setOverlay('event');
  };

  const closeOverlay = () => {
    setOverlay(null);
    setSelectedEventId(null);
  };

  const navigateToDayView = (_date: string) => {
    // BUILD-TIME: precise date handed to DayView via lifted state — wired in a future pass
    setActiveView('day');
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50">
      <Header onProfileOpen={() => setOverlay('profile')} />
      <Body
        activeView={activeView}
        onEventOpen={openEventOverlay}
      />
      <Footer
        activeView={activeView}
        onViewChange={setActiveView}
        onCoachOpen={() => setOverlay('coach')}
        onMenuOpen={() => setOverlay('menu')}
      />

      {overlay === 'event' && selectedEventId && (
        <EventOverlay eventId={selectedEventId} onClose={closeOverlay} />
      )}
      {overlay === 'coach' && (
        <CoachOverlay
          onClose={closeOverlay}
          onOpenEvent={openEventOverlay}
          onNavigateToDayView={navigateToDayView}
        />
      )}
      {overlay === 'profile' && <ProfileOverlay onClose={closeOverlay} />}
      {overlay === 'menu' && <MenuOverlay onClose={closeOverlay} />}
    </div>
  );
}
