import { useMemo, useState } from 'react';
import { autoCompleteSystemTask } from '../../../../../engine/resourceEngine';
import { useUserStore } from '../../../../../stores/useUserStore';
import type { GearSlot } from '../../../../../types';
import type { GearDefinition } from '../../../../../types/coach';
import { AvatarEquipView } from './AvatarEquipView';
import { GearDetailPopup } from './GearDetailPopup';
import { InventoryListView } from './InventoryListView';
import {
  GEAR_SLOT_LABELS,
  GEAR_SLOT_ORDER,
  RARITY_BADGE,
  RARITY_RING,
  formatStatBonus,
  getGearDefinition,
  getGearIcon,
} from './equipmentRoomData';

type SlotFilter = 'all' | GearSlot;

interface SelectedGearState {
  gear: GearDefinition;
  mode: 'equip' | 'unequip';
}

const FILTERS: SlotFilter[] = ['all', ...GEAR_SLOT_ORDER];

export function EquipmentRoom() {
  const ownedGearIds = useUserStore((state) => state.user?.progression.equipment.equipment ?? []);
  const equippedGear = useUserStore((state) => state.user?.progression.avatar.equippedGear ?? {});
  const equipGear = useUserStore((state) => state.equipGear);
  const unequipGear = useUserStore((state) => state.unequipGear);

  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
  const [selectedGear, setSelectedGear] = useState<SelectedGearState | null>(null);

  const ownedGear = useMemo(
    () =>
      ownedGearIds
        .map((gearId) => getGearDefinition(gearId))
        .filter((gear): gear is GearDefinition => gear !== null),
    [ownedGearIds],
  );

  const visibleGear = useMemo(
    () => ownedGear.filter((gear) => slotFilter === 'all' || gear.slot === slotFilter),
    [ownedGear, slotFilter],
  );

  const selectedEquippedSlot = useMemo(() => {
    if (!selectedGear || selectedGear.mode !== 'unequip') return null;
    return GEAR_SLOT_ORDER.find((slot) => equippedGear[slot] === selectedGear.gear.id) ?? selectedGear.gear.slot;
  }, [equippedGear, selectedGear]);

  function openEquippedSlot(slot: GearSlot) {
    const gear = getGearDefinition(equippedGear[slot]);
    if (!gear) return;
    setSelectedGear({ gear, mode: 'unequip' });
  }

  function openOwnedGear(gear: GearDefinition) {
    setSelectedGear({ gear, mode: 'equip' });
  }

  function handlePopupAction() {
    if (!selectedGear) return;

    if (selectedGear.mode === 'equip') {
      equipGear(selectedGear.gear.slot, selectedGear.gear.id);
      autoCompleteSystemTask('task-sys-equip-gear');
    } else if (selectedEquippedSlot) {
      unequipGear(selectedEquippedSlot);
    }

    setSelectedGear(null);
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-col p-3">
        <div className="flex h-full min-h-0 w-full gap-3">
          <div className="w-[40%] min-w-[148px] max-w-[320px] flex-none">
            <AvatarEquipView onSelectSlot={openEquippedSlot} />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/80">
              <div className="mb-4 flex flex-col gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">Gear Collection</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Owned gear filtered by slot. Tap a card to inspect and equip.</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {FILTERS.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setSlotFilter(filter)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        slotFilter === filter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter === 'all' ? 'All' : GEAR_SLOT_LABELS[filter]}
                    </button>
                  ))}
                </div>
              </div>

              {visibleGear.length === 0 ? (
                <div className="flex flex-1 items-center">
                  <p className="w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-400">
                    No owned gear matches this slot filter yet.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden pb-1">
                  <div className="flex h-full gap-3">
                    {visibleGear.map((gear) => {
                      const equippedInSlot = equippedGear[gear.slot] === gear.id;

                      return (
                        <button
                          key={gear.id}
                          type="button"
                          onClick={() => openOwnedGear(gear)}
                          className={`flex h-full min-h-[168px] w-[176px] shrink-0 flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ring-1 dark:border-gray-700 dark:bg-gray-800/90 ${RARITY_RING[gear.rarity]}`}
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-3xl dark:bg-emerald-900/40">
                            {getGearIcon(gear)}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-700 dark:text-gray-200">
                              {GEAR_SLOT_LABELS[gear.slot]}
                            </span>
                            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${RARITY_BADGE[gear.rarity]}`}>
                              {gear.rarity}
                            </span>
                            {equippedInSlot ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                                Equipped
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-3 text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">{gear.name}</p>
                          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{formatStatBonus(gear)}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <InventoryListView className="flex min-h-0 flex-1" />
          </div>
        </div>
      </div>

      {selectedGear ? (
        <GearDetailPopup
          gear={selectedGear.gear}
          actionLabel={
            selectedGear.mode === 'equip'
              ? equippedGear[selectedGear.gear.slot] === selectedGear.gear.id
                ? 'Equipped'
                : 'Equip'
              : 'Unequip'
          }
          actionDisabled={
            selectedGear.mode === 'equip' && equippedGear[selectedGear.gear.slot] === selectedGear.gear.id
          }
          slotOverride={selectedEquippedSlot ?? undefined}
          onAction={handlePopupAction}
          onClose={() => setSelectedGear(null)}
        />
      ) : null}
    </>
  );
}
