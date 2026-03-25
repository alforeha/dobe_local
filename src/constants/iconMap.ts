// ─────────────────────────────────────────
// ICON MAP — D93
// Single source of truth: icon key string → visual representation.
// LOCAL v1 uses emoji. Future builds swap in SVG sprites or icon font refs.
// ─────────────────────────────────────────

export const ICON_MAP: Record<string, string> = {
  // task types
  check: '✅',
  counter: '🔢',
  rating: '⭐',
  text: '📝',
  choice: '🔘',
  checklist: '☑️',
  log: '📓',
  sets_reps: '🏋️',
  circuit: '⚡',
  duration: '⏱️',
  timer: '⏳',
  form: '📋',
  scan: '📷',
  location_point: '📍',
  location_trail: '🗺️',
  roll: '🎲',
  // categories
  health: '❤️',
  fitness: '💪',
  mindfulness: '🧘',
  nutrition: '🥗',
  home: '🏠',
  vehicle: '🚗',
  work: '💼',
  admin: '📁',
  finance: '💰',
  social: '👥',
  learning: '📚',
  // stats
  strength: '⚔️',
  agility: '⚡',
  defense: '🛡️',
  charisma: '💬',
  wisdom: '🔮',
  // events and routines
  routine: '🔄',
  event: '📅',
  welcome: '👋',
  quest: '🎯',
  daily: '☀️',
  // general
  default: '📌',
}

export function resolveIcon(key: string | null | undefined): string {
  if (!key) return ICON_MAP['default']
  return ICON_MAP[key.toLowerCase()] ?? key
  // if key not in map, return key as-is (handles emoji passed directly
  // during migration — forward compatible)
}
