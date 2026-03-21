import { useState, useEffect, useRef } from 'react';
import { useSystemStore } from '../../stores/useSystemStore';
import { useScheduleStore } from '../../stores/useScheduleStore';
import { Header } from './Header';
import { Body } from './Body';
import { Footer } from './Footer';
import { SlideUpOverlay } from '../overlays/SlideUpOverlay';
import { EventOverlay } from '../overlays/event/EventOverlay';
import { CoachOverlay } from '../overlays/coach/CoachOverlay';
import { ProfileOverlay } from '../overlays/profile/ProfileOverlay';
import { MenuOverlay } from '../overlays/menu/MenuOverlay';
import { OneOffEventPopup } from '../overlays/menu/rooms/ScheduleRoom/OneOffEventPopup';
import type { TimeView } from '../timeViews/TimeViewContainer';

export type ActiveOverlay = 'event' | 'coach' | 'profile' | 'menu' | null;

export function AppShell() {
  const [activeView, setActiveView] = useState<TimeView>('day');
  const [overlay, setOverlay] = useState<ActiveOverlay>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editPlannedId, setEditPlannedId] = useState<string | null>(null);
  const [weekViewSeed, setWeekViewSeed] = useState<Date | null>(null);
  const [overlayClosing, setOverlayClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mode = useSystemStore((s) => s.settings?.displayPreferences?.mode ?? 'dark');
  const plannedEvents = useScheduleStore((s) => s.plannedEvents);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const handleWeekSelect = (weekStart: Date) => {
    setWeekViewSeed(weekStart);
    setActiveView('week');
  };

  const openEventOverlay = (eventId: string) => {
    // Cancel any in-flight close animation before switching overlays.
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOverlayClosing(false);
    setSelectedEventId(eventId);
    setOverlay('event');
  };

  /** Immediately tears down the overlay (used internally after animation). */
  const closeOverlay = () => {
    setOverlay(null);
    setSelectedEventId(null);
    setOverlayClosing(false);
  };

  /** Triggers the slide-down exit animation, then tears down after 230 ms. */
  const requestClose = () => {
    if (closeTimerRef.current !== null) return; // already closing
    setOverlayClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      closeOverlay();
    }, 230);
  };

  const navigateToDayView = (_date: string) => {
    // BUILD-TIME: precise date handed to DayView via lifted state — wired in a future pass
    setActiveView('day');
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header onProfileOpen={() => setOverlay('profile')} />
      <Body
        activeView={activeView}
        onEventOpen={openEventOverlay}
        onWeekSelect={handleWeekSelect}
        weekViewSeed={weekViewSeed}
        onEditPlanned={(id) => setEditPlannedId(id)}
      />
      <Footer
        activeView={activeView}
        onViewChange={setActiveView}
        onCoachOpen={() => setOverlay('coach')}
        onMenuOpen={() => setOverlay('menu')}
      />

      {overlay === 'event' && selectedEventId && (
        <SlideUpOverlay closing={overlayClosing} onBackdropClick={requestClose}>
          <EventOverlay eventId={selectedEventId} onClose={requestClose} />
        </SlideUpOverlay>
      )}
      {overlay === 'coach' && (
        <SlideUpOverlay closing={overlayClosing} onBackdropClick={requestClose}>
          <CoachOverlay
            onClose={requestClose}
            onOpenEvent={openEventOverlay}
            onNavigateToDayView={navigateToDayView}
          />
        </SlideUpOverlay>
      )}
      {overlay === 'profile' && (
        <SlideUpOverlay closing={overlayClosing} onBackdropClick={requestClose}>
          <ProfileOverlay onClose={requestClose} />
        </SlideUpOverlay>
      )}
      {overlay === 'menu' && (
        <SlideUpOverlay closing={overlayClosing} onBackdropClick={requestClose}>
          <MenuOverlay onClose={requestClose} />
        </SlideUpOverlay>
      )}

      {/* One-off event edit popup — opened by tapping a future planned event block in DayView */}
      {editPlannedId && (
        <OneOffEventPopup
          editEvent={plannedEvents[editPlannedId] ?? null}
          onClose={() => setEditPlannedId(null)}
        />
      )}
    </div>
  );
}
