// DigiCB generic record engine — shared (client-safe) types and field schemas.
// The server store persists arbitrary record collections keyed by `collection`.
// Each module (applications, clients, projects, …) defines a FieldSchema list
// describing its form fields, list columns and status workflow.

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox"
  | "email"
  | "tel"
  | "ref"; // reference to another collection record

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  help?: string;
  refCollection?: string; // for "ref" fields
  refLabelKey?: string; // display field in referenced collection
  refNumberKey?: string; // record number field in referenced collection
  listCol?: boolean; // show in default list table
  listWidth?: string;
  filterable?: boolean;
}

export interface StatusDef {
  value: string;
  label: string;
  tone: "muted" | "info" | "warning" | "danger" | "success";
  isClosed?: boolean;
}

export interface WorkflowStage {
  value: string;
  label: string;
  tone: "muted" | "info" | "warning" | "danger" | "success";
}

export interface CollectionDef {
  key: string;
  label: string;
  singular: string;
  numberPrefix: string;
  fields: FieldSchema[];
  statuses: StatusDef[];
  workflow?: WorkflowStage[]; // ordered kanban stages
  searchableText: (r: Record<string, unknown>) => string;
}

// A stored record. Arbitrary fields + standard envelope metadata.
export interface StoredRecord {
  id: string;
  number: string; // human-readable e.g. APP-2026-0007
  collection: string;
  status: string;
  owner: string | null; // user email
  ownerId: string | null; // user id
  branchId: string | null;
  framework: string | null; // framework key
  data: Record<string, unknown>;
  archived: boolean;
  demo: boolean;
  createdBy: string;
  createdById: string;
  createdAt: number;
  updatedBy: string;
  updatedAt: number;
  comments: CommentEntry[];
  attachments: AttachmentEntry[];
  history: HistoryEntry[];
}

export interface CommentEntry {
  id: string;
  author: string;
  body: string;
  ts: number;
}

export interface AttachmentEntry {
  id: string;
  name: string;
  size: number;
  kind: string;
  uploadedBy: string;
  ts: number;
}

export interface HistoryEntry {
  id: string;
  actor: string;
  action: string;
  field?: string;
  prev?: string;
  next?: string;
  reason?: string;
  ts: number;
}

// DTO returned to clients (StoredRecord minus nothing sensitive; all data is
// tenant-scoped business records, not secrets).
export type RecordDTO = StoredRecord;

export interface ListResult {
  records: RecordDTO[];
  total: number;
}

export interface SaveInput {
  collection: string;
  id?: string; // present when editing
  data: Record<string, unknown>;
  status?: string;
  ownerEmail?: string;
  branchId?: string;
  framework?: string;
}
