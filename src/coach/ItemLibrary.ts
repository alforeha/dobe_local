// ─────────────────────────────────────────
// ItemLibrary — static useable item definitions (D90)
// Authoring-time catalogue of all consumables and facilities
// surfaced in the Items tab of RecommendationsRoom.
// ─────────────────────────────────────────

import type { ResourceType } from '../types/resource';

// ── ITEM DEFINITION ───────────────────────────────────────────────────────────

export type ItemKind = 'consumable' | 'facility';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemCategory =
  | 'kitchen'
  | 'bedroom'
  | 'cleaning'
  | 'garden'
  | 'vehicle'
  | 'bathroom'
  | 'workspace';

export interface ItemDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  kind: ItemKind;
  /** Which resource type this item belongs to */
  resourceType: ResourceType;
  /** TaskTemplateLibrary id of the associated task — null if no specific task */
  associatedTaskTemplateRef: string | null;
  category: ItemCategory;
  rarity: ItemRarity;
}

// ── ITEM LIBRARY ──────────────────────────────────────────────────────────────

export const itemLibrary: ItemDefinition[] = [

  // ── CONSUMABLES ─────────────────────────────────────────────────────────────

  {
    id: 'item-onion',
    name: 'Onion',
    icon: '🧅',
    description: 'A kitchen staple. Good for soups, stews, and building discipline.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: 'item-tmpl-cut-onions-01',
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-coffee-beans',
    name: 'Coffee Beans',
    icon: '☕',
    description: 'The foundation of a productive morning.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: 'item-tmpl-morning-coffee-01',
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-cleaning-supplies',
    name: 'Cleaning Supplies',
    icon: '🧹',
    description: 'Sprays, cloths, and brushes — the kit for a clean space.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: 'item-tmpl-clean-room-01',
    category: 'cleaning',
    rarity: 'common',
  },
  {
    id: 'item-laundry-detergent',
    name: 'Laundry Detergent',
    icon: '🫧',
    description: 'Fresh clothes start here.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: 'item-tmpl-do-laundry-01',
    category: 'cleaning',
    rarity: 'common',
  },
  {
    id: 'item-cooking-oil',
    name: 'Cooking Oil',
    icon: '🫙',
    description: 'Essential for cooking almost anything well.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-bread',
    name: 'Bread',
    icon: '🍞',
    description: 'A staple on every table.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-eggs',
    name: 'Eggs',
    icon: '🥚',
    description: 'Versatile, nutritious, and always in demand.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-bin-bags',
    name: 'Bin Bags',
    icon: '🗑️',
    description: 'Keep the house clean — always have a spare roll.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'cleaning',
    rarity: 'common',
  },
  {
    id: 'item-toilet-paper',
    name: 'Toilet Paper',
    icon: '🧻',
    description: 'Never let this run out. Ever.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'bathroom',
    rarity: 'common',
  },
  {
    id: 'item-shampoo',
    name: 'Shampoo',
    icon: '🧴',
    description: 'Daily grooming essential.',
    kind: 'consumable',
    resourceType: 'inventory',
    associatedTaskTemplateRef: null,
    category: 'bathroom',
    rarity: 'common',
  },

  // ── FACILITIES ──────────────────────────────────────────────────────────────

  {
    id: 'item-bed',
    name: 'Bed',
    icon: '🛏️',
    description: 'Make it every morning. Start the day right.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-make-bed-01',
    category: 'bedroom',
    rarity: 'common',
  },
  {
    id: 'item-car',
    name: 'Car',
    icon: '🚗',
    description: 'A weekly check keeps it running safely.',
    kind: 'facility',
    resourceType: 'vehicle',
    associatedTaskTemplateRef: 'item-tmpl-weekly-car-check-01',
    category: 'vehicle',
    rarity: 'common',
  },
  {
    id: 'item-oven',
    name: 'Oven',
    icon: '🍳',
    description: 'Monthly cleaning prevents buildup and fire hazards.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-clean-oven-01',
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-garden',
    name: 'Garden',
    icon: '🌱',
    description: 'Water daily and it will reward you.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-water-plants-01',
    category: 'garden',
    rarity: 'common',
  },
  {
    id: 'item-washing-machine',
    name: 'Washing Machine',
    icon: '🫧',
    description: 'Run a wash whenever the basket fills.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-run-wash-01',
    category: 'cleaning',
    rarity: 'common',
  },
  {
    id: 'item-fridge',
    name: 'Fridge',
    icon: '🧊',
    description: 'Clean it monthly to keep food fresh and safe.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-clean-fridge-01',
    category: 'kitchen',
    rarity: 'common',
  },
  {
    id: 'item-desk',
    name: 'Desk',
    icon: '🖥️',
    description: 'A clear desk is a clear mind.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-clear-desk-01',
    category: 'workspace',
    rarity: 'common',
  },
  {
    id: 'item-shower',
    name: 'Shower',
    icon: '🚿',
    description: 'Weekly descale keeps it fresh and flowing.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-clean-shower-01',
    category: 'bathroom',
    rarity: 'common',
  },
  {
    id: 'item-lawnmower',
    name: 'Lawnmower',
    icon: '🌿',
    description: 'Fire it up weekly in growing season.',
    kind: 'facility',
    resourceType: 'home',
    associatedTaskTemplateRef: 'item-tmpl-mow-lawn-01',
    category: 'garden',
    rarity: 'rare',
  },
  {
    id: 'item-bicycle',
    name: 'Bicycle',
    icon: '🚲',
    description: 'Check tyre pressure regularly for a safe ride.',
    kind: 'facility',
    resourceType: 'vehicle',
    associatedTaskTemplateRef: 'item-tmpl-check-tyre-01',
    category: 'vehicle',
    rarity: 'common',
  },
];
