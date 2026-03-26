// ICON MAP - D93
// Single source of truth: icon key string -> visual representation.
// LOCAL v1 uses emoji. Future builds can swap in SVG sprites or icon font refs.

export const ICON_MAP: Record<string, string> = {
  // task types
  check: '\u2705',
  counter: '\ud83d\udd22',
  rating: '\u2b50',
  text: '\ud83d\udcdd',
  choice: '\ud83d\udd18',
  checklist: '\u2611\ufe0f',
  log: '\ud83d\udcd3',
  sets_reps: '\ud83c\udfcb\ufe0f',
  circuit: '\u26a1',
  duration: '\u23f1\ufe0f',
  timer: '\u23f3',
  form: '\ud83d\udccb',
  scan: '\ud83d\udcf7',
  location_point: '\ud83d\udccd',
  location_trail: '\ud83d\uddfa\ufe0f',
  roll: '\ud83c\udfb2',
  // categories
  health: '\u2764\ufe0f',
  fitness: '\ud83d\udcaa',
  mindfulness: '\ud83e\uddd8',
  nutrition: '\ud83e\udd57',
  home: '\ud83c\udfe0',
  vehicle: '\ud83d\ude97',
  work: '\ud83d\udcbc',
  admin: '\ud83d\udcc1',
  finance: '\ud83d\udcb0',
  social: '\ud83d\udc65',
  learning: '\ud83d\udcda',
  // stats
  strength: '\u2694\ufe0f',
  agility: '\u26a1',
  defense: '\ud83d\udee1\ufe0f',
  charisma: '\ud83d\udcac',
  wisdom: '\ud83d\udd2e',
  // gear slots
  head: '\ud83e\udde2',
  body: '\ud83d\udc55',
  hand: '\ud83e\udde4',
  feet: '\ud83d\udc62',
  accessory: '\ud83d\udc8d',
  // events and routines
  routine: '\ud83d\udd04',
  event: '\ud83d\udcc5',
  welcome: '\ud83d\udc4b',
  quest: '\ud83c\udfaf',
  daily: '\u2600\ufe0f',
  'boost-early-bird': '\ud83c\udf05',
  'boost-late-night': '\ud83c\udf19',
  'boost-streak': '\ud83d\udd25',
  'boost-roll': '\ud83c\udfb2',
  // act types
  'act-onboarding': '\ud83d\udc38',
  'act-daily': '\u2600\ufe0f',
  'act-health': '\u2764\ufe0f',
  'act-strength': '\u2694\ufe0f',
  'act-agility': '\u26a1',
  'act-defense': '\ud83d\udee1\ufe0f',
  'act-charisma': '\ud83d\udcac',
  'act-wisdom': '\ud83d\udd2e',
  // chain types
  chain: '\ud83d\udd17',
  'chain-daily': '\ud83d\udcc5',
  'chain-stat': '\ud83d\udcca',
  // gear assets
  'gear:gear-starter-hat': '\ud83e\udde2',
  'gear:gear-work-shirt': '\ud83d\udc55',
  'gear:gear-adventurer-jacket': '\ud83e\udde5',
  'gear:gear-work-gloves': '\ud83e\udde4',
  'gear:gear-streak-gloves': '\ud83e\udd4a',
  'gear:gear-veteran-boots': '\ud83d\udc62',
  'gear:gear-endurance-boots': '\ud83d\udc5f',
  'gear:gear-legendary-crown': '\ud83d\udc51',
  'gear:gear-task-master-ring': '\ud83d\udc8d',
  'gear:gear-all-rounder-amulet': '\ud83d\udcff',
  'gear:gear-coach-drop-ribbon': '\ud83c\udf80',
  // general
  default: '\ud83d\udccc',
};

export function resolveIcon(key: string | null | undefined): string {
  if (!key) return ICON_MAP.default;
  if (key.startsWith('icon:ach-') || key.startsWith('sticker:ach-')) return '\ud83c\udfc5';
  return ICON_MAP[key.toLowerCase()] ?? key;
}
