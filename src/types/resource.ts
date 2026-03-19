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
}

/**
 * Home meta — generates: chore tasks (CHECK / CHECKLIST)
 * rooms[] is a BUILD-time task shape.
 */
export interface HomeRoom {
  name: string;
  icon: string | null;
  assignedTo: string | null;
  linkedDocs: string[];
  linkedLayoutRef: string | null;
}

export interface HomeMeta {
  address: string | null;
  rooms: HomeRoom[];
}

/**
 * Vehicle meta — generates: maintenance tasks (CHECKLIST / LOG)
 */
export interface VehicleMeta {
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  linkedDocs: string[];
}

/**
 * Account meta — generates: transaction tasks (LOG)
 * kind discriminator distinguishes different account types.
 * linkedAccountRef for linked accounts (e.g. credit → checking).
 * pendingTransactions[] for shopping list → transaction flow.
 */
export type AccountKind = 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | string;

export type PendingTransactionStatus = 'pending' | 'assigned' | 'posted';

export interface PendingTransaction {
  itemRef: string; // Useable ref or free-text label
  status: PendingTransactionStatus;
  assignedAccountRef: string | null;
  amount: number | null;
  note: string | null;
}

export interface AccountMeta {
  kind: AccountKind;
  institution: string | null;
  /** For linked accounts e.g. credit card linked to checking */
  linkedAccountRef: string | null;
  pendingTransactions: PendingTransaction[];
  /** RecurrenceRule refs for bills and paydays */
  bills: string[];
  paydays: string[];
}

/**
 * Inventory meta — generates: replenish tasks (COUNTER)
 * Supports any Resource as linkedResourceRef (container pattern).
 */
export interface InventoryMeta {
  /** Any Resource ref — for container pattern */
  linkedResourceRef: string | null;
  /** Useable refs */
  useables: string[];
}

/**
 * Doc meta — generates: no task generation
 * walkthrough type for guided document review.
 */
export type DocType = 'walkthrough' | 'reference' | 'contract' | string;

export interface DocMeta {
  docType: DocType;
  fileRef: string | null;
  expiryDate: string | null; // ISO date
  linkedResourceRef: string | null;
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
