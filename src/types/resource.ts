// ─────────────────────────────────────────
// RESOURCE — RESOURCE CLUSTER
// Parent object for all real-world resources.
// Type-specific data lives in meta{}.
// Each resource type generates a specific task category via prebuilt
// templates in RecommendationsLibrary (D42).
// ─────────────────────────────────────────

// ── RESOURCE TYPE ─────────────────────────────────────────────────────────────

export type ResourceType = 'contact' | 'home' | 'vehicle' | 'account' | 'inventory' | 'doc';

// ── RESOURCE LOG ENTRY ───────────────────────────────────────────────────────

export interface ResourceLogEntry {
  note: string;
  timestamp: string; // ISO date
  /** Optional Task ref */
  taskRef?: string;
}

// ── RESOURCE NOTE (D95) ───────────────────────────────────────────────────────

export interface ResourceNote {
  id: string;
  text: string;
  createdAt: string; // ISO datetime
}

// ── CONTACT GROUPS (D96) ─────────────────────────────────────────────────────

export const CONTACT_GROUPS = [
  'family',
  'friend',
  'acquaintance',
  'colleague',
  'coworker',
] as const;

export type ContactGroup = typeof CONTACT_GROUPS[number];

// ── META SHAPES (D42) — one per ResourceType ─────────────────────────────────

/**
 * Contact meta — generates: birthday task (CHECK with annual recurrence)
 * info{} is a flexible data bag designed for MULTI-USER extension.
 */
export interface ContactInfo {
  birthday?: string; // ISO date
  phone?: string;
  email?: string;
  address?: string;
  customFields?: Record<string, string>;
}

export interface ContactLink {
  contactId: string;
  relationship: string;
}

export interface ContactMeta {
  info: ContactInfo;
  customTag: string | null;
  /** Predefined group membership — D96 */
  groups?: ContactGroup[];
  /** Timestamped note log — D95 */
  notes?: ResourceNote[];
  /** Linked contact relationships — D96 */
  linkedContactRefs?: ContactLink[];
  /**
   * Days before birthday to push a GTD reminder.
   * Default 14. Set to 0 for day-of only. Set to -1 to never push.
   */
  birthdayLeadDays?: number;
}

/**
 * Home meta — generates: chore tasks (CHECK / CHECKLIST)
 * rooms[] — each room has a stable id ref (D42).
 * chores[] — household recurring tasks.
 */
export interface HomeRoom {
  id: string;
  icon: string;
  name: string;
  /** Contact IDs assigned to this room */
  assignedTo: string[];
}

export interface HomeChore {
  id: string;
  icon: string;
  name: string;
  recurrence: ResourceRecurrenceRule;
  /** Single contact ID or 'all' */
  assignedTo: string;
}

export interface HomeMeta {
  /** Contact IDs — household members */
  members?: string[];
  rooms?: HomeRoom[];
  chores?: HomeChore[];
  /** Linked Inventory Resource ref */
  linkedInventoryRef: string | null;
  /** Lease, photos, and other Doc refs */
  linkedDocs: string[];
  /** [MULTI-USER] stub — null in LOCAL */
  recurringTasksStub: null;
  /** Physical address — W23 */
  address?: string;
  /** Timestamped note log — D95/W23 */
  notes?: ResourceNote[];
}

export const RECURRENCE_DAYS_OF_WEEK = ['sun','mon','tue','wed','thu','fri','sat'] as const;
export type RecurrenceDayOfWeek = typeof RECURRENCE_DAYS_OF_WEEK[number];

export interface ResourceRecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** How many frequency units between occurrences. Default 1. */
  interval: number;
  /** Days of week — only meaningful when frequency='weekly'. */
  days: RecurrenceDayOfWeek[];
  /** ISO date YYYY-MM-DD — when the recurrence starts. */
  seedDate: string;
  /** ISO date to stop, or null for indefinite. */
  endsOn: string | null;
}

/** Returns a ResourceRecurrenceRule defaulting to weekly from today. */
export function makeDefaultRecurrenceRule(): ResourceRecurrenceRule {
  return {
    frequency: 'weekly',
    interval: 1,
    days: [],
    seedDate: new Date().toISOString().slice(0, 10),
    endsOn: null,
  };
}

/** Coerces legacy string recurrence values to ResourceRecurrenceRule. */
export function toRecurrenceRule(r: unknown): ResourceRecurrenceRule {
  if (r && typeof r === 'object' && 'frequency' in r) return r as ResourceRecurrenceRule;
  const freq = typeof r === 'string' ? r : 'weekly';
  return {
    frequency: (['daily','weekly','monthly','yearly'].includes(freq)
      ? freq
      : 'weekly') as ResourceRecurrenceRule['frequency'],
    interval: 1,
    days: [],
    seedDate: new Date().toISOString().slice(0, 10),
    endsOn: null,
  };
}

export interface VehicleMaintenanceTask {
  id: string;
  icon: string;
  name: string;
  recurrence: ResourceRecurrenceRule;
  /** Days before task triggers a GTD push. Default 14. -1 = never. */
  reminderLeadDays: number;
}

/**
 * Vehicle meta — generates: maintenance tasks (CHECKLIST / LOG)
 */
export interface VehicleMeta {
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  /** Contact Resource refs for vehicle users */
  memberContactRefs: string[];
  /** Loan doc, photos, insurance refs */
  linkedDocs: string[];
  /** [MULTI-USER] stub — null in LOCAL */
  recurringTasksStub: null;
  /** License plate — W24 */
  licensePlate?: string | null;
  /** ISO date — GTD item within 30 days — W24 */
  insuranceExpiry?: string | null;
  /** Days before insuranceExpiry to push GTD. Default 30. -1 = never. */
  insuranceLeadDays?: number;
  /** ISO date — GTD item within 14 days — W24 */
  serviceNextDate?: string | null;
  /** Days before serviceNextDate to push GTD. Default 14. -1 = never. */
  serviceLeadDays?: number;
  /** Recurring maintenance task definitions */
  maintenanceTasks?: VehicleMaintenanceTask[];
  /** Timestamped note log — D95/W24 */
  notes?: ResourceNote[];
}

/**
 * Account meta — generates: transaction tasks (LOG)
 * kind discriminator: bank | bill | income | debt | subscription | allowance (D42).
 * linkedAccountRef for linked accounts (e.g. bill → bank).
 * pendingTransactions[] for shopping list → transaction flow.
 */
export type AccountKind = 'bank' | 'bill' | 'income' | 'debt' | 'subscription' | 'allowance' | string;

export type PendingTransactionStatus = 'pending' | 'assigned' | 'posted';

export interface PendingTransaction {
  id: string;
  date: string; // ISO date
  description: string;
  /** Shopping list item ref */
  sourceRef: string | null;
  assignedAccountRef: string | null;
  amount: number | null;
  status: PendingTransactionStatus;
}

export interface AccountTask {
  id: string;
  icon: string;
  name: string;
  recurrence: ResourceRecurrenceRule;
  /** Days before task triggers a GTD push. Default 7. -1 = never. */
  reminderLeadDays: number;
}

export interface AccountMeta {
  kind: AccountKind;
  /** Points bill/income/allowance at a bank Account Resource */
  linkedAccountRef: string | null;
  /** Optional — Home, Vehicle, or Contact context */
  linkedResourceRef: string | null;
  /** Lease, contract, loan doc refs */
  linkedDocs: string[];
  /** Running balance — user can override */
  balance: number;
  /** Audit trail on manual balance override */
  balanceOverriddenAt: string | null; // ISO date
  /** For bill, income, allowance — recurring schedule ref */
  recurrenceRuleRef: string | null;
  /** Expected recurring amount */
  amount: number | null;
  pendingTransactions: PendingTransaction[];
  /** Prebuilt TaskTemplate ref — generates transaction task */
  transactionTaskRef: string | null;
  /** Institution name — W25 */
  institution?: string | null;
  /** Display nickname — W25 */
  accountNickname?: string | null;
  /** ISO date — payment due — GTD item within 7 days — W25 */
  dueDate?: string | null;
  /** Days before dueDate to push GTD. Default 7. -1 = never. */
  dueDateLeadDays?: number;
  /** Recurring transaction task definitions — G */
  accountTasks?: AccountTask[];
  /** Timestamped note log — D95/W25 */
  notes?: ResourceNote[];
}

/**
 * Inventory meta — generates: replenish tasks (COUNTER)
 * containers[] group items by physical location.
 * items[] track Useable refs with quantity and optional container assignment.
 */
export interface InventoryContainer {
  id: string;
  name: string;
  icon: string | null;
  /** Any Resource ref — Home/Vehicle/Contact for lending, null = standalone */
  linkedResourceRef: string | null;
  notes: string | null;
}

export interface InventoryItem {
  id: string;
  /** Emoji or icon key for this item */
  icon: string;
  name: string;
  quantity: number;
  /** Unit label e.g. 'kg', 'units' */
  unit?: string;
  /** Per-item low-stock threshold — GTD fires when quantity <= threshold */
  threshold?: number;
  /** Optional linked Resource ref */
  linkedResourceRef?: string;
}

export interface InventoryMeta {
  containers: InventoryContainer[];
  items: InventoryItem[];
  /** Category label e.g. 'Kitchen', 'Tools' */
  category?: string;
  /** Resource IDs this inventory belongs to (e.g. a Home) — H */
  linkedResourceRefs?: string[];
  /** Timestamped note log — D95/W26 */
  notes?: ResourceNote[];
}

/**
 * Doc meta — generates: no task generation in LOCAL.
 * progression{} is reserved for course docs — deferred (BUILD-time task).
 */
export type DocType = 'reference' | 'course' | 'manual' | 'contract' | 'receipt' | 'other' | string;

export interface DocMeta {
  docType: DocType;
  /** Rich text — for 'text' type docs */
  content: string;
  /** For manuals, contracts, layouts — links to owning Resource */
  linkedResourceRef: string | null;
  /** RecommendationsLibrary course ref — for 'course' type docs */
  courseRef: string | null;
  /** [BUILD-time] Locked progression state for course docs — stub null in LOCAL */
  progression: null;
  tags: string[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  /** External link — W27 */
  url?: string | null;
  /** ISO date — GTD item within 30 days — W27 */
  expiryDate?: string | null;
  /** Days before expiryDate to push GTD. Default 30. -1 = never. */
  expiryLeadDays?: number;
  /** Walkthrough mode — W27 */
  walkthroughType?: 'linear' | 'checklist' | 'none';
  /** Resource IDs this doc belongs to (Home, Vehicle, Contact) — I */
  linkedResourceRefs?: string[];
  /** Timestamped note log — D95/W27 */
  notes?: ResourceNote[];
}

// ── META UNION ────────────────────────────────────────────────────────────────

export type ResourceMeta =
  | ContactMeta
  | HomeMeta
  | VehicleMeta
  | AccountMeta
  | InventoryMeta
  | DocMeta;

// ── RESOURCE ROOT ─────────────────────────────────────────────────────────────

export interface Resource {
  /** uuid */
  id: string;
  name: string;
  /** Ref to icon asset */
  icon: string;
  description: string;
  type: ResourceType;
  /** Attachment refs — optional */
  attachments: string[];
  log: ResourceLogEntry[];
  meta: ResourceMeta;
}
