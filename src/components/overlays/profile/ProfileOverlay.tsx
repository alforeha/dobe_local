import { useState } from 'react';
import { ProfileTopSection } from './ProfileTopSection';
import { ProfileFloatingActions } from './ProfileFloatingActions';
import { StatGroupRoom } from './rooms/StatGroupRoom/StatGroupRoom';
import { PreferencesRoom } from './rooms/PreferencesRoom/PreferencesRoom';
import { StorageRoom } from './rooms/StorageRoom';
import { BadgeRoom } from './rooms/BadgeRoom/BadgeRoom';
import { EquipmentRoom } from './rooms/EquipmentRoom/EquipmentRoom';
import { TalentTreeRoom } from './rooms/TalentTreeRoom/TalentTreeRoom';

export type ProfileRoom = 'stats' | 'preferences' | 'storage' | 'badges' | 'equipment' | 'talent';

interface ProfileOverlayProps {
  onClose: () => void;
}

export function ProfileOverlay({ onClose }: ProfileOverlayProps) {
  const [activeRoom, setActiveRoom] = useState<ProfileRoom>('stats');

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-white">
      {/* Close button */}
      <button
        type="button"
        className="absolute right-4 top-4 z-50 text-gray-400 hover:text-gray-600 text-xl"
        onClick={onClose}
        aria-label="Close profile"
      >
        ✕
      </button>

      {/* Top section with avatar, XP bar, shortcuts */}
      <ProfileTopSection
        onAvatarClick={() => setActiveRoom('stats')}
        onBadgesClick={() => setActiveRoom('badges')}
        onEquipmentClick={() => setActiveRoom('equipment')}
      />

      {/* Room content */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activeRoom === 'stats' && (
            <StatGroupRoom onTalentTree={() => setActiveRoom('talent')} />
          )}
          {activeRoom === 'preferences' && <PreferencesRoom />}
          {activeRoom === 'storage' && <StorageRoom />}
          {activeRoom === 'badges' && <BadgeRoom />}
          {activeRoom === 'equipment' && <EquipmentRoom />}
          {activeRoom === 'talent' && <TalentTreeRoom />}
        </div>

        {/* Floating action buttons — 4 FABs on the right */}
        <ProfileFloatingActions onNav={setActiveRoom} />
      </div>
    </div>
  );
}

