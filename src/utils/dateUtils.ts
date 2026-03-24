/** Shared date formatting utilities for time views */

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type FormatType = 'display' | 'iso' | 'short' | 'monthYear' | 'time';

/**
 * Returns a YYYY-MM-DD string in the user's LOCAL timezone.
 * Use instead of toISOString().slice(0,10) which gives the UTC date and
 * causes events to appear one day off for users ahead of UTC.
 */
export function localISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Format a Date into a string of the given type */
export function format(date: Date, type: FormatType): string {
  switch (type) {
    case 'display':
      // DDD MMM DD
      return `${DAY_NAMES[date.getDay()]} ${MONTH_NAMES[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
    case 'iso':
      // YYYY-MM-DD in local timezone (not UTC)
      return localISODate(date);
    case 'short':
      // MM/DD
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    case 'monthYear':
      // MMM YYYY
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    case 'time': {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    default:
      return date.toLocaleDateString();
  }
}

/** Return HH:MM string for a given hour number */
export function hourLabel(h: number): string {
  return String(h).padStart(2, '0');
}

/** Get the previous Monday from (or equal to) a given date */
export function getPrevMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Add N days to a date, returning new Date */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/** Return array of 7 dates Mon-Sun for the week containing `date` */
export function getWeekDays(date: Date): Date[] {
  const monday = getPrevMonday(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** True if two dates are the same calendar day */
export function isSameDay(a: Date, b: Date): boolean {
  return format(a, 'iso') === format(b, 'iso');
}

/** Return the number of the ISO week */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
}
