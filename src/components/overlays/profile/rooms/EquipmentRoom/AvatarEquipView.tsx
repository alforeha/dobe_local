import { useMemo } from 'react';
import { useUserStore } from '../../../../../stores/useUserStore';
import {
  GEAR_SLOT_LABELS,
  GEAR_SLOT_ORDER,
  RARITY_RING,
  formatStatBonus,
  getGearDefinition,
  getGearIcon,
  getSlotIcon,
} from './equipmentRoomData';
import type { GearSlot } from '../../../../../types';

interface AvatarEquipViewProps {
  onSelectSlot: (slot: GearSlot) => void;
}

export function AvatarEquipView({ onSelectSlot }: AvatarEquipViewProps) {
  const equippedGear = useUserStore((state) => state.user?.progression.avatar.equippedGear ?? {});

  const slotCards = useMemo(
    () =>
      GEAR_SLOT_ORDER.map((slot) => ({
        slot,
        gear: getGearDefinition(equippedGear[slot]),
      })),
    [equippedGear],
  );

  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Equipped Slots</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Tap a filled slot to inspect or unequip gear.</p>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {slotCards.map(({ slot, gear }) => {
          const isAccessory = slot === 'accessory';

          return (
            <button
              key={slot}
              type="button"
              onClick={() => gear && onSelectSlot(slot)}
              disabled={!gear}
              className={`rounded-2xl border p-3 text-left transition ${
                isAccessory ? 'col-span-2 justify-self-center w-full max-w-[220px]' : ''
              } ${
                gear
                  ? `bg-emerald-50/70 hover:bg-emerald-50 ring-1 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 ${RARITY_RING[gear.rarity]}`
                  : 'border-dashed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-500'
              } ${!gear ? 'cursor-default' : ''}`}
            >
              <div className="flex min-h-[110px] flex-col items-center justify-center rounded-xl bg-white/70 px-3 py-4 text-center dark:bg-gray-900/60">
                {gear ? (
                  <>
                    <span className="text-4xl leading-none">{getGearIcon(gear)}</span>
                    <p className="mt-3 text-xs font-semibold text-gray-800 dark:text-gray-100">{gear.name}</p>
                    <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">{formatStatBonus(gear)}</p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl leading-none opacity-50">{getSlotIcon(slot)}</span>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">Empty</p>
                  </>
                )}
              </div>
              <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {GEAR_SLOT_LABELS[slot]}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
