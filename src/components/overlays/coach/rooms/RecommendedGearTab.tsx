// ─────────────────────────────────────────
// RecommendedGearTab — Gear sub-view for RecommendationsRoom
// Shows all gear from CharacterLibrary as a 2-column grid.
// Owned (id in equipment.equipment[]) → full colour icon.
// Not owned → greyscale/silhouette, no stat bonus shown.
// Filter by slot and primary stat bonus.
// ─────────────────────────────────────────

import { useMemo, useState } from 'react';
import { characterLibrary } from '../../../../coach';
import { useUserStore } from '../../../../stores/useUserStore';
import type { GearDefinition } from '../../../../types/coach';

// ── EMOJI ICONS ─────────────────────────────────────────────────────────────

const ASSET_EMOJI: Record<string, string> = {
  'gear:gear-starter-hat':       '🧢',
  'gear:gear-work-shirt':        '👕',
  'gear:gear-adventurer-jacket': '🧥',
  'gear:gear-work-gloves':       '🧤',
  'gear:gear-streak-gloves':     '🥊',
  'gear:gear-veteran-boots':     '👢',
  'gear:gear-endurance-boots':   '👟',
  'gear:gear-legendary-crown':   '👑',
  'gear:gear-task-master-ring':  '💍',
  'gear:gear-all-rounder-amulet':'🔮',
  'gear:gear-coach-drop-ribbon': '🎀',
};

function getGearEmoji(assetRef: string): string {
  return ASSET_EMOJI[assetRef] ?? '⚙️';
}

// ── RARITY STYLES ────────────────────────────────────────────────────────────

const RARITY_BADGE: Record<string, string> = {
  common:    'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  rare:      'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  epic:      'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  legendary: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
};

const RARITY_RING: Record<string, string> = {
  common:    'ring-gray-200 dark:ring-gray-600',
  rare:      'ring-blue-300 dark:ring-blue-600',
  epic:      'ring-purple-400 dark:ring-purple-500',
  legendary: 'ring-amber-400 dark:ring-amber-500',
};

// ── STAT FILTERS ─────────────────────────────────────────────────────────────

type StatKey = 'health' | 'strength' | 'agility' | 'defense' | 'charisma' | 'wisdom';
const STAT_KEYS: StatKey[] = ['health', 'strength', 'agility', 'defense', 'charisma', 'wisdom'];

const STAT_LABELS: Record<StatKey, string> = {
  health:   'Health',
  strength: 'Strength',
  agility:  'Agility',
  defense:  'Defense',
  charisma: 'Charisma',
  wisdom:   'Wisdom',
};

const STAT_ICONS: Record<StatKey, string> = {
  health:   '❤️',
  strength: '⚔️',
  agility:  '⚡',
  defense:  '🛡️',
  charisma: '💬',
  wisdom:   '📖',
};

// ── SLOT FILTERS ─────────────────────────────────────────────────────────────

type SlotFilter = 'all' | 'head' | 'body' | 'hand' | 'feet' | 'accessory';
const SLOTS: SlotFilter[] = ['all', 'head', 'body', 'hand', 'feet', 'accessory'];
const SLOT_LABELS: Record<SlotFilter, string> = {
  all: 'All', head: 'Head', body: 'Body', hand: 'Hand', feet: 'Feet', accessory: 'Acc',
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getPrimaryStatBonus(gear: GearDefinition): { stat: StatKey; value: number } | null {
  const bonus = gear.statBonus;
  if (!bonus) return null;
  let bestStat: StatKey | null = null;
  let bestVal = 0;
  for (const key of STAT_KEYS) {
    const val = bonus[key] ?? 0;
    if (val > bestVal) { bestVal = val; bestStat = key; }
  }
  return bestStat ? { stat: bestStat, value: bestVal } : null;
}

function formatStatBonus(gear: GearDefinition): string | null {
  const sb = gear.statBonus;
  if (!sb) return null;
  const entries = STAT_KEYS.filter((k) => (sb[k] ?? 0) > 0);
  if (entries.length === 0) return null;
  if (entries.length === 1) {
    const k = entries[0];
    return `+${sb[k]} XP ${k}`;
  }
  // All-rounder case
  return entries.map((k) => `+${sb[k]} ${k}`).join(' · ');
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export function RecommendedGearTab() {
  const equipment = useUserStore((s) => s.user?.progression.equipment.equipment ?? []);
  const ownedSet = useMemo(() => new Set(equipment), [equipment]);

  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
  const [statFilter, setStatFilter] = useState<StatKey | 'all'>('all');

  const gear = characterLibrary.gearDefinitions;

  const visible = useMemo(() => {
    let list = gear;
    if (slotFilter !== 'all') list = list.filter((g) => g.slot === slotFilter);
    if (statFilter !== 'all') {
      list = list.filter((g) => {
        const primary = getPrimaryStatBonus(g);
        return primary?.stat === statFilter;
      });
    }
    return list;
  }, [gear, slotFilter, statFilter]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Filters ── */}
      <div className="shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
        {/* Slot pills */}
        <div className="flex flex-wrap gap-1">
          {SLOTS.map((s) => (
            <FilterPill
              key={s}
              label={SLOT_LABELS[s]}
              active={slotFilter === s}
              onClick={() => setSlotFilter(s)}
            />
          ))}
        </div>
        {/* Stat pills */}
        <div className="flex flex-wrap gap-1">
          <FilterPill
            label="All Stats"
            active={statFilter === 'all'}
            onClick={() => setStatFilter('all')}
          />
          {STAT_KEYS.map((k) => (
            <FilterPill
              key={k}
              label={`${STAT_ICONS[k]} ${STAT_LABELS[k]}`}
              active={statFilter === k}
              onClick={() => setStatFilter(k)}
            />
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No gear matches your filter.
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {visible.map((g) => (
            <GearCard
              key={g.id}
              gear={g}
              owned={ownedSet.has(g.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FILTER PILL ───────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}

// ── GEAR CARD ─────────────────────────────────────────────────────────────────

interface GearCardProps {
  gear: GearDefinition;
  owned: boolean;
}

function GearCard({ gear, owned }: GearCardProps) {
  const emoji = getGearEmoji(gear.assetRef);
  const rarityBadge = RARITY_BADGE[gear.rarity] ?? RARITY_BADGE.common;
  const rarityRing  = RARITY_RING[gear.rarity]  ?? RARITY_RING.common;
  const statLabel = owned ? formatStatBonus(gear) : null;

  return (
    <div
      className={`flex flex-col items-center rounded-lg p-3 gap-2 ring-1 transition-opacity ${rarityRing} ${
        owned
          ? 'bg-white dark:bg-gray-800'
          : 'bg-gray-50 dark:bg-gray-900 opacity-60'
      }`}
    >
      {/* Icon */}
      <span
        className="text-3xl leading-none"
        style={owned ? undefined : { filter: 'grayscale(100%)' }}
        aria-hidden="true"
      >
        {emoji}
      </span>

      {/* Name */}
      <p
        className={`text-xs font-semibold text-center leading-tight ${
          owned ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {gear.name}
      </p>

      {/* Slot + Rarity badges */}
      <div className="flex flex-wrap gap-1 justify-center">
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
          {gear.slot}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${rarityBadge}`}>
          {gear.rarity}
        </span>
      </div>

      {/* Stat bonus (owned only) */}
      {statLabel && (
        <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 text-center leading-tight">
          {statLabel}
        </p>
      )}
    </div>
  );
}
