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

export interface ContactMeta {
  info: ContactInfo;
  customTag: string | null;
  /** Group membership strings */
  groups: string[];
  /** Freetext notes */
  notes: string;
}

/**
 * Home meta — generates: chore tasks (CHECK / CHECKLIST)
 * rooms[] — each room has an explicit id for stable refs (D42).
 * assignedTo supports a list of contact refs or the literal 'all'.
 */
export interface HomeRoom {
  id: string;
  name: string;
  icon: string | null;
  /** Contact Resource refs or the literal string 'all' */
  assignedTo: string[] | 'all';
  linkedDocs: string[];
  linkedLayoutRef: string | null;
}

export interface HomeMeta {
  /** Contact Resource refs for household members */
  memberContactRefs: string[];
  rooms: HomeRoom[];
  /** Linked Inventory Resource ref */
  linkedInventoryRef: string | null;
  /** Lease, photos, and other Doc refs */
  linkedDocs: string[];
  /** [MULTI-USER] stub — null in LOCAL */
  recurringTasksStub: null;
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
  useableRef: string;
  /** null = uncontained */
  containerId: string | null;
  quantity: number;
}

export interface InventoryMeta {
  containers: InventoryContainer[];
  items: InventoryItem[];
}

/**
 * Doc meta — generates: no task generation in LOCAL.
 * progression{} is reserved for course docs — deferred (BUILD-time task).
 */
export type DocType = 'text' | 'pdf' | 'contract' | 'manual' | 'layout' | 'course' | 'walkthrough' | string;

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
