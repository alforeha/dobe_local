// ─────────────────────────────────────────
// TASK TEMPLATE — TASK / SCHEDULE CLUSTER
// Universal task blueprint. Instanced into Tasks by Markers, FavouritesList,
// and RecommendationsLibrary. No UUID — lives inside parent objects.
// User custom templates in taskLibrary only (D34).
//
// Also contains: RecurrenceRule, inputFields shapes for all 15 TaskTypes (D38, D41).
// ─────────────────────────────────────────

// ── RECURRENCE RULE ───────────────────────────────────────────────────────────
// Custom lightweight recurrence definition.
// Used by PlannedEvent, Marker, and Resource Account bills/paydays (D28, D37).

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface RecurrenceRule {
  /**
   * daily = shorthand, days[] ignored.
   * monthly uses parent seedDate or Marker.lastFired to resolve nth-weekday implicitly (D37).
   */
  frequency: RecurrenceFrequency;
  /** Which weekdays fire within the period. Ignored for daily and monthly (D37) */
  days: Weekday[];
  /** Every N periods — default 1 */
  interval: number;
  /** null = indefinite */
  endsOn: string | null; // ISO date
  /** Optional expression for unusual patterns e.g. friday-13th */
  customCondition: string | null;
}

// ── TASK TYPE ENUM (D38) ──────────────────────────────────────────────────────

export type TaskType =
  | 'CHECK'
  | 'COUNTER'
  | 'SETS_REPS'
  | 'CIRCUIT'
  | 'DURATION'
  | 'TIMER'
  | 'RATING'
  | 'TEXT'
  | 'FORM'
  | 'CHOICE'
  | 'CHECKLIST'
  | 'SCAN'
  | 'LOG'
  | 'LOCATION_POINT'
  | 'LOCATION_TRAIL';

// ── INPUT FIELDS — per TaskType (D41) ────────────────────────────────────────
// Each interface defines the inputFields{} shape for a given TaskType.

export interface CheckInputFields {
  label: string;
}

export interface CounterInputFields {
  target: number;
  unit: string;
  step: number;
}

export interface SetsRepsInputFields {
  sets: number;
  reps: number;
  weight: number | null;
  weightUnit: string | null;
  /** Time to rest after a set (seconds) */
  restAfter: number | null;
  /** true for drop sets — BUILD-time task */
  dropSet: boolean;
}

export interface CircuitInputFields {
  exercises: string[];
  rounds: number;
  /** Time to rest between rounds (seconds) */
  restBetweenRounds: number | null;
}

export interface DurationInputFields {
  targetDuration: number; // seconds
  unit: 'seconds' | 'minutes' | 'hours';
}

export interface TimerInputFields {
  countdownFrom: number; // seconds
}

export interface RatingInputFields {
  scale: number; // e.g. 5 or 10
  label: string;
}

export interface TextInputFields {
  prompt: string;
  maxLength: number | null;
}

export interface FormField {
  key: string;
  label: string;
  fieldType: 'text' | 'number' | 'boolean' | 'date';
}

export interface FormInputFields {
  fields: FormField[];
}

export interface ChoiceInputFields {
  options: string[];
  multiSelect: boolean;
}

export interface ChecklistItem {
  key: string;
  label: string;
}

export interface ChecklistInputFields {
  items: ChecklistItem[];
}

export interface ScanInputFields {
  scanType: 'barcode' | 'qr' | string;
}

export interface LogInputFields {
  fields: FormField[];
}

export interface LocationPointInputFields {
  label: string;
  captureAccuracy: boolean;
}

export interface LocationTrailInputFields {
  label: string;
  captureInterval: number | null; // seconds, null = manual
}

export type InputFields =
  | CheckInputFields
  | CounterInputFields
  | SetsRepsInputFields
  | CircuitInputFields
  | DurationInputFields
  | TimerInputFields
  | RatingInputFields
  | TextInputFields
  | FormInputFields
  | ChoiceInputFields
  | ChecklistInputFields
  | ScanInputFields
  | LogInputFields
  | LocationPointInputFields
  | LocationTrailInputFields;

// ── SECONDARY TAG ────────────────────────────────────────────────────────────
// Fixed enum for grouping and filtering in the TASK room.
// Enum values are BUILD-time content decisions — extend at BUILD time.
// User-defined tags deferred to a future chapter.

export type TaskSecondaryTag =
  | 'fitness'      // exercise, training, sport (strength + agility stat group)
  | 'nutrition'    // food, diet, meal prep
  | 'health'       // medical, body checks, wellbeing
  | 'mindfulness'  // meditation, mental health, self-care (defense stat group)
  | 'home'         // housekeeping, maintenance, errands
  | 'finance'      // budgeting, bills, saving
  | 'admin'        // scheduling, paperwork, organisation
  | 'learning'     // study, courses, reading (wisdom stat group)
  | 'social'       // relationships, family, friends (charisma stat group)
  | 'work';        // career, professional tasks

// ── XP AWARD ─────────────────────────────────────────────────────────────────
// Partial StatGroup record — values sum to total XP awarded (D43).
// Custom template default: +5 to assigned stat group.

export interface XpAward {
  health: number;
  strength: number;
  agility: number;
  defense: number;
  charisma: number;
  wisdom: number;
}

// ── TASK TEMPLATE ROOT ────────────────────────────────────────────────────────

export interface TaskTemplate {
  /** Identifier used only on prebuilt templates (app bundle). Not present on user custom templates. */
  id?: string;
  name: string;
  description: string;
  /** Ref to icon asset */
  icon: string;
  taskType: TaskType;
  /** Typed input shape per taskType (D41) */
  inputFields: InputFields;
  /** Partial StatGroup record — sum = total XP (D43) */
  xpAward: XpAward;
  /** Minutes. null = no cooldown (D41) */
  cooldown: number | null;
  /** Optional instructional content ref — video or image shown before completion */
  media: string | null;
  /** Optional Useable refs — items required for completion */
  items: string[];
  /** Optional category tag for grouping and filtering in TASK room. Enum values BUILD-time. */
  secondaryTag: TaskSecondaryTag | null;
}
