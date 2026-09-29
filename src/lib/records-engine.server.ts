// DigiCB record store + generic CRUD engine. Server-only.
// Persists arbitrary collections of StoredRecord alongside the legacy typed DB.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { loadDB, saveDB, uid, now, logEntry } from "./digicb-store.server";
import type { SessionUser } from "./digicb-types";
import type {
  StoredRecord,
  RecordDTO,
  ListResult,
  SaveInput,
  CommentEntry,
  AttachmentEntry,
  HistoryEntry,
} from "./records-schema";
import { COLLECTIONS, getCollectionDef } from "./records-collections";
import { seedRecords } from "./records-seed.server";
import { seedExtendedRecords } from "./records-seed-ext.server";
import { seedInternalExpanded } from "./records-seed-internal.server";
import { seedAllFrameworkRisks } from "./records-risks-seed-all.server";

// Records live in their own file so the legacy typed store stays stable.
const REC_FILE = "/tmp/digicb-records.json";

interface RecordDB {
  records: StoredRecord[];
  counters: Record<string, number>;
}

let cache: RecordDB | null = null;

export function loadRec(): RecordDB {
  if (cache) return cache;
  if (existsSync(REC_FILE)) {
    try {
      const persisted = JSON.parse(readFileSync(REC_FILE, "utf-8")) as RecordDB;
      cache = mergeSeeds(persisted);
      return cache;
    } catch {
      /* fall through */
    }
  }
  cache = seedRecords();
  cache = mergeSeeds(cache);
  saveRec();
  return cache;
}

// Merge any seed records missing from a persisted DB back in. This fixes the
// "empty risk register" bug: when /tmp/digicb-records.json was written before
// the framework risk seeds existed, loadRec() returned the stale file forever
// and never picked up the new clause-linked risk records.
function mergeSeeds(db: RecordDB): RecordDB {
  const existingIds = new Set(db.records.map((r) => r.id));
  let changed = false;
  // Extended-collection demo records (audits, ncrs, decisions, etc.)
  for (const r of seedExtendedRecords()) {
    if (!existingIds.has(r.id)) {
      db.records.push(r);
      existingIds.add(r.id);
      const prefix = r.number.split("-")[0];
      const seq = parseInt(r.number.split("-")[2] ?? "0", 10);
      db.counters[prefix] = Math.max(db.counters[prefix] ?? 0, seq);
      changed = true;
    }
  }
  // Expanded internal-audit & management-review records (all 4 frameworks)
  for (const r of seedInternalExpanded()) {
    if (!existingIds.has(r.id)) {
      db.records.push(r);
      existingIds.add(r.id);
      const prefix = r.number.split("-")[0];
      const seq = parseInt(r.number.split("-")[2] ?? "0", 10);
      db.counters[prefix] = Math.max(db.counters[prefix] ?? 0, seq);
      changed = true;
    }
  }
  // Detailed framework risk records (clause-linked, all 4 frameworks)
  for (const r of seedAllFrameworkRisks()) {
    if (!existingIds.has(r.id)) {
      db.records.push(r);
      existingIds.add(r.id);
      changed = true;
    }
  }
  if (changed) saveRecInternal(db);
  return db;
}

function saveRecInternal(db: RecordDB): void {
  try {
    writeFileSync(REC_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("DigiCB record store save failed", e);
  }
}

function saveRec(): void {
  saveRecInternal(cache);
}

// Force generation of framework risk records for a specific framework (or all
// if frameworkId is null). Used by the "Generate Framework Risks" admin action.
// Idempotent: only adds risks whose stable id is missing.
export function generateFrameworkRisks(frameworkId: string | null): {
  added: number;
  total: number;
} {
  const db = loadRec();
  const existingIds = new Set(db.records.map((r) => r.id));
  const allRisks = seedAllFrameworkRisks();
  const target = frameworkId ? allRisks.filter((r) => r.framework === frameworkId) : allRisks;
  let added = 0;
  for (const r of target) {
    if (!existingIds.has(r.id)) {
      db.records.push(r);
      existingIds.add(r.id);
      added++;
    }
  }
  if (added > 0) saveRec();
  return { added, total: target.length };
}

// ---------------------------------------------------------------- CRUD engine

function nextNumber(coll: string): string {
  const db = loadRec();
  const def = getCollectionDef(coll);
  const year = new Date().getFullYear();
  db.counters[coll] = (db.counters[coll] ?? 0) + 1;
  const seq = String(db.counters[coll]).padStart(4, "0");
  saveRec();
  return `${def.numberPrefix}-${year}-${seq}`;
}

export function listRecords(
  coll: string,
  opts: {
    search?: string;
    status?: string;
    framework?: string;
    branchId?: string;
    owner?: string;
    archived?: boolean;
    statusIn?: string[];
  } = {},
): ListResult {
  const db = loadRec();
  let recs = db.records.filter((r) => r.collection === coll);
  const archived = opts.archived ?? false;
  recs = recs.filter((r) => r.archived === archived);
  if (opts.status) recs = recs.filter((r) => r.status === opts.status);
  if (opts.statusIn && opts.statusIn.length)
    recs = recs.filter((r) => opts.statusIn!.includes(r.status));
  if (opts.framework) recs = recs.filter((r) => r.framework === opts.framework);
  if (opts.branchId) recs = recs.filter((r) => r.branchId === opts.branchId);
  if (opts.owner) recs = recs.filter((r) => r.owner === opts.owner);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    recs = recs.filter((r) => {
      const def = getCollectionDef(coll);
      const hay = (def.searchableText(r) + " " + r.number).toLowerCase();
      return hay.includes(q);
    });
  }
  recs.sort((a, b) => b.updatedAt - a.updatedAt);
  return { records: recs, total: recs.length };
}

export function getRecord(coll: string, id: string): RecordDTO | null {
  const db = loadRec();
  const r = db.records.find((x) => x.id === id && x.collection === coll);
  return r ?? null;
}

export function createRecord(user: SessionUser, input: SaveInput): RecordDTO {
  const db = loadRec();
  const def = getCollectionDef(input.collection);
  const number = nextNumber(input.collection);
  const ts = now();
  const status = input.status ?? def.statuses[0]?.value ?? "draft";
  const rec: StoredRecord = {
    id: uid("rec"),
    number,
    collection: input.collection,
    status,
    owner: input.ownerEmail ?? user.email,
    ownerId: user.id,
    branchId: input.branchId ?? user.branchId,
    framework: input.framework ?? null,
    data: { ...input.data },
    archived: false,
    demo: false,
    createdBy: user.email,
    createdById: user.id,
    createdAt: ts,
    updatedBy: user.email,
    updatedAt: ts,
    comments: [],
    attachments: [],
    history: [{ id: uid("h"), actor: user.email, action: "Record created", ts: now() }],
  };
  db.records.push(rec);
  appendAudit(user.email, `${def.singular} created`, number);
  saveRec();
  return rec;
}

export function updateRecord(
  user: SessionUser,
  coll: string,
  id: string,
  input: Partial<SaveInput>,
): RecordDTO | null {
  const db = loadRec();
  const rec = db.records.find((r) => r.id === id && r.collection === coll);
  if (!rec) return null;
  const def = getCollectionDef(coll);
  const changes: HistoryEntry[] = [];
  if (input.data) {
    for (const [k, v] of Object.entries(input.data)) {
      const prev = rec.data[k];
      if (JSON.stringify(prev) !== JSON.stringify(v)) {
        const field = def.fields.find((f) => f.key === k);
        changes.push({
          id: uid("h"),
          actor: user.email,
          action: "Field changed",
          field: field?.label ?? k,
          prev: toStr(prev),
          next: toStr(v),
          ts: now(),
        });
        rec.data[k] = v;
      }
    }
  }
  if (input.status && input.status !== rec.status) {
    changes.push({
      id: uid("h"),
      actor: user.email,
      action: "Status changed",
      prev: rec.status,
      next: input.status,
      ts: now(),
    });
    rec.status = input.status;
  }
  if (input.ownerEmail !== undefined && input.ownerEmail !== rec.owner) {
    rec.owner = input.ownerEmail;
  }
  if (input.branchId !== undefined && input.branchId !== rec.branchId) {
    rec.branchId = input.branchId;
  }
  if (input.framework !== undefined && input.framework !== rec.framework) {
    rec.framework = input.framework;
  }
  rec.updatedBy = user.email;
  rec.updatedAt = now();
  if (changes.length) rec.history.unshift(...changes);
  appendAudit(user.email, `${def.singular} updated`, rec.number);
  saveRec();
  return rec;
}

export function changeStatus(
  user: SessionUser,
  coll: string,
  id: string,
  status: string,
  reason?: string,
): RecordDTO | null {
  updateRecord(user, coll, id, { status });
  if (reason) {
    const db = loadRec();
    const r = db.records.find((x) => x.id === id && x.collection === coll);
    if (r) {
      r.history.unshift({
        id: uid("h"),
        actor: user.email,
        action: "Status change reason",
        reason,
        ts: now(),
      });
      saveRec();
    }
  }
  return getRecord(coll, id);
}

export function duplicateRecord(user: SessionUser, coll: string, id: string): RecordDTO | null {
  const src = getRecord(coll, id);
  if (!src) return null;
  const copy: StoredRecord = {
    ...src,
    data: { ...src.data },
    id: uid("rec"),
    number: nextNumber(coll),
    status: getCollectionDef(coll).statuses[0]?.value ?? "draft",
    archived: false,
    owner: user.email,
    ownerId: user.id,
    createdBy: user.email,
    createdById: user.id,
    createdAt: now(),
    updatedBy: user.email,
    updatedAt: now(),
    comments: [],
    attachments: [],
    history: [
      {
        id: uid("h"),
        actor: user.email,
        action: `Duplicated from ${src.number}`,
        ts: now(),
      },
    ],
  };
  // Mark copied data title so duplicates are identifiable
  const titleField = getCollectionDef(coll).fields.find((f) => f.key === "title");
  if (titleField && typeof copy.data.title === "string") {
    copy.data.title = `${copy.data.title} (copy)`;
  }
  loadRec().records.push(copy);
  appendAudit(user.email, `${getCollectionDef(coll).singular} duplicated`, copy.number);
  saveRec();
  return copy;
}

export function archiveRecord(
  user: SessionUser,
  coll: string,
  id: string,
  archived: boolean,
): RecordDTO | null {
  const db = loadRec();
  const rec = db.records.find((r) => r.id === id && r.collection === coll);
  if (!rec) return null;
  rec.archived = archived;
  rec.updatedBy = user.email;
  rec.updatedAt = now();
  rec.history.unshift({
    id: uid("h"),
    actor: user.email,
    action: archived ? "Archived" : "Restored",
    ts: now(),
  });
  appendAudit(user.email, archived ? "Archived" : "Restored", rec.number);
  saveRec();
  return rec;
}

export function addComment(
  user: SessionUser,
  coll: string,
  id: string,
  body: string,
): RecordDTO | null {
  const db = loadRec();
  const rec = db.records.find((r) => r.id === id && r.collection === coll);
  if (!rec) return null;
  const c: CommentEntry = { id: uid("c"), author: user.email, body, ts: now() };
  rec.comments.push(c);
  rec.updatedBy = user.email;
  rec.updatedAt = now();
  rec.history.unshift({
    id: uid("h"),
    actor: user.email,
    action: "Comment added",
    ts: now(),
  });
  saveRec();
  return rec;
}

export function addAttachment(
  user: SessionUser,
  coll: string,
  id: string,
  info: { name: string; size: number; kind: string },
): RecordDTO | null {
  const db = loadRec();
  const rec = db.records.find((r) => r.id === id && r.collection === coll);
  if (!rec) return null;
  const a: AttachmentEntry = {
    id: uid("a"),
    name: info.name,
    size: info.size,
    kind: info.kind,
    uploadedBy: user.email,
    ts: now(),
  };
  rec.attachments.push(a);
  rec.history.unshift({
    id: uid("h"),
    actor: user.email,
    action: "Attachment uploaded",
    field: info.name,
    ts: now(),
  });
  saveRec();
  return rec;
}

// Move a record to a new workflow stage (status) with a reason; used by Kanban.
export function moveStage(
  user: SessionUser,
  coll: string,
  id: string,
  stage: string,
  reason?: string,
): RecordDTO | null {
  const db = loadRec();
  const rec = db.records.find((r) => r.id === id && r.collection === coll);
  if (!rec) return null;
  const def = getCollectionDef(coll);
  const valid = def.workflow?.some((w) => w.value === stage);
  if (!valid && stage !== rec.status) {
    // allow any defined status as fallback
    if (!def.statuses.some((s) => s.value === stage)) return rec;
  }
  if (rec.status !== stage) {
    rec.history.unshift({
      id: uid("h"),
      actor: user.email,
      action: "Stage moved",
      prev: rec.status,
      next: stage,
      reason,
      ts: now(),
    });
    rec.status = stage;
    rec.updatedBy = user.email;
    rec.updatedAt = now();
    appendAudit(user.email, `Stage → ${stage}`, rec.number);
  }
  saveRec();
  return rec;
}

// Convert an approved application into a certification project, carrying over
// client + framework + scope data without retyping.
export function convertApplicationToProject(user: SessionUser, appId: string): RecordDTO | null {
  const app = getRecord("applications", appId);
  if (!app) return null;
  const def = getCollectionDef("projects");
  const number = nextNumber("projects");
  const ts = now();
  const proj: StoredRecord = {
    id: uid("rec"),
    number,
    collection: "projects",
    status: def.statuses[0]?.value ?? "inquiry",
    owner: user.email,
    ownerId: user.id,
    branchId: app.branchId,
    framework: app.framework,
    data: {
      title: `Certification project — ${app.data.clientName ?? app.data.organizationName ?? app.number}`,
      applicationId: app.id,
      applicationNumber: app.number,
      clientId: app.data.clientId,
      clientName: app.data.clientName ?? app.data.organizationName,
      standard: app.data.standard,
      scope: app.data.scope,
      framework: app.framework,
      scheme: app.data.scheme,
    },
    archived: false,
    demo: false,
    createdBy: user.email,
    createdById: user.id,
    createdAt: ts,
    updatedBy: user.email,
    updatedAt: ts,
    comments: [],
    attachments: [],
    history: [
      {
        id: uid("h"),
        actor: user.email,
        action: `Converted from application ${app.number}`,
        ts: now(),
      },
    ],
  };
  loadRec().records.push(proj);
  // mark application converted
  app.status = "converted";
  app.history.unshift({
    id: uid("h"),
    actor: user.email,
    action: "Converted to certification project",
    field: proj.number,
    ts: now(),
  });
  appendAudit(user.email, "Application converted to project", app.number);
  saveRec();
  return proj;
}

function appendAudit(actor: string, action: string, target: string): void {
  const db = loadDB();
  db.auditLogs.unshift(
    logEntry(actor, `record.${action.toLowerCase().replace(/\s+/g, "_")}`, target),
  );
  saveDB();
}

function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// re-export for server functions
export { COLLECTIONS };
