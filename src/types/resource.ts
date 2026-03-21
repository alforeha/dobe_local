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
  /** Optional refs to related resources, e.g. a Home resource */
  linkedResourceRefs?: string[];
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
  /** Physical address — W23 */
  address?: string;
  /** Freetext notes — W23 */
  notes?: string;
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
  /** ISO date — GTD item within 14 days — W24 */
  serviceNextDate?: string | null;
  /** Freetext notes — W24 */
  notes?: string;
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
  /** Institution name — W25 */
  institution?: string | null;
  /** Display nickname — W25 */
  accountNickname?: string | null;
  /** ISO date — payment due — GTD item within 7 days — W25 */
  dueDate?: string | null;
  /** Freetext notes — W25 */
  notes?: string;
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
  /** Display name for LOCAL v1 (useableRef not resolved in-app) — W26 */
  name?: string;
  /** Unit label e.g. 'kg', 'units' — W26 */
  unit?: string | null;
  /** Linked Resource ref — W26 */
  linkedResourceRef?: string | null;
}

export interface InventoryMeta {
  containers: InventoryContainer[];
  items: InventoryItem[];
  /** Category label e.g. 'Kitchen', 'Tools' — W26 */
  category?: string;
  /** Items at or below this quantity trigger a GTD item — W26 */
  lowStockThreshold?: number | null;
  /** Freetext notes — W26 */
  notes?: string;
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
  /** External link — W27 */
  url?: string | null;
  /** ISO date — GTD item within 30 days — W27 */
  expiryDate?: string | null;
  /** Walkthrough mode — W27 */
  walkthroughType?: 'linear' | 'checklist' | 'none';
  /** Freetext notes — W27 */
  notes?: string;
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
