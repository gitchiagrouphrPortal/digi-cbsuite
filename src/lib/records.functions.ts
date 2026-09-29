// DigiCB record server functions — thin RPC wrappers over the record engine.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie } from "./digicb-session";
import { getSession } from "./digicb-auth.server";
import type { SessionUser } from "./digicb-types";
import {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  changeStatus,
  duplicateRecord,
  archiveRecord,
  addComment,
  addAttachment,
  moveStage,
  convertApplicationToProject,
  generateFrameworkRisks,
} from "./records-engine.server";
import { getCertificationTimeline, listCertifiedClients } from "./records-timeline.server";
import { COLLECTIONS } from "./records-collections";

const SESSION_COOKIE = "digicb_session";

function requireUser(): SessionUser {
  const token = getCookie(SESSION_COOKIE);
  const user = getSession(token);
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

const listSchema = z.object({
  collection: z.string(),
  search: z.string().optional(),
  status: z.string().optional(),
  framework: z.string().optional(),
  branchId: z.string().optional(),
  owner: z.string().optional(),
  archived: z.boolean().optional(),
  statusIn: z.array(z.string()).optional(),
});

export const listRecordsFn = createServerFn({ method: "GET" })
  .validator((data) => listSchema.parse(data))
  .handler(async ({ data }) => {
    requireUser();
    return listRecords(data.collection, data);
  });

export const getRecordFn = createServerFn({ method: "GET" })
  .validator((data) => z.object({ collection: z.string(), id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    requireUser();
    return getRecord(data.collection, data.id);
  });

const saveSchema = z.object({
  collection: z.string(),
  id: z.string().optional(),
  data: z.record(z.unknown()),
  status: z.string().optional(),
  ownerEmail: z.string().optional(),
  branchId: z.string().optional(),
  framework: z.string().optional(),
});

export const saveRecordFn = createServerFn({ method: "POST" })
  .validator((data) => saveSchema.parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    if (!COLLECTIONS[data.collection]) return { ok: false, error: "Unknown collection" };
    if (data.id) {
      const r = updateRecord(user, data.collection, data.id, data);
      return { ok: !!r, record: r };
    }
    const r = createRecord(user, data);
    return { ok: !!r, record: r };
  });

export const changeStatusFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        collection: z.string(),
        id: z.string(),
        status: z.string(),
        reason: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = changeStatus(user, data.collection, data.id, data.status, data.reason);
    return { ok: !!r, record: r };
  });

export const duplicateRecordFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ collection: z.string(), id: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = duplicateRecord(user, data.collection, data.id);
    return { ok: !!r, record: r };
  });

export const archiveRecordFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ collection: z.string(), id: z.string(), archived: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = archiveRecord(user, data.collection, data.id, data.archived);
    return { ok: !!r, record: r };
  });

export const addCommentFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ collection: z.string(), id: z.string(), body: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = addComment(user, data.collection, data.id, data.body);
    return { ok: !!r, record: r };
  });

export const addAttachmentFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        collection: z.string(),
        id: z.string(),
        name: z.string(),
        size: z.number(),
        kind: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = addAttachment(user, data.collection, data.id, data);
    return { ok: !!r, record: r };
  });

export const moveStageFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        collection: z.string(),
        id: z.string(),
        stage: z.string(),
        reason: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = moveStage(user, data.collection, data.id, data.stage, data.reason);
    return { ok: !!r, record: r };
  });

export const convertApplicationFn = createServerFn({ method: "POST" })
  .validator((data) => z.object({ applicationId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const user = requireUser();
    const r = convertApplicationToProject(user, data.applicationId);
    return { ok: !!r, record: r };
  });

// Return collection definitions + reference data for the client (form rendering).
export const getCollectionDefsFn = createServerFn({ method: "GET" })
  .validator((data) => z.object({ collections: z.array(z.string()).optional() }).parse(data))
  .handler(async ({ data }) => {
    requireUser();
    const keys = data.collections ?? Object.keys(COLLECTIONS);
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const def = COLLECTIONS[k];
      if (def) out[k] = def;
    }
    // Build reference option lists for ref fields so forms can populate selects.
    const refs: Record<string, { id: string; number: string; label: string }[]> = {};
    const refColls = new Set<string>();
    for (const k of keys) {
      const def = COLLECTIONS[k];
      if (!def) continue;
      for (const f of def.fields) {
        if (f.type === "ref" && f.refCollection) refColls.add(f.refCollection);
      }
    }
    for (const c of refColls) {
      const cdef = COLLECTIONS[c];
      if (!cdef) continue;
      const { records } = listRecords(c, { archived: false });
      const labelKey =
        cdef.fields.find((f) => f.key === cdef.fields.find((g) => g.type === "ref")?.refLabelKey)
          ?.key ??
        cdef.fields.find((f) => f.listCol)?.key ??
        "organizationName";
      refs[c] = records.map((r) => ({
        id: r.id,
        number: r.number,
        label: String(r.data[labelKey] ?? r.number),
      }));
    }
    return { defs: out, refs };
  });

export const generateFrameworkRisksFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z.object({ frameworkId: z.string().nullable().optional() }).parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    requireUser();
    return generateFrameworkRisks(data.frameworkId ?? null);
  });

export const listCertifiedClientsFn = createServerFn({ method: "GET" }).handler(async () => {
  requireUser();
  return listCertifiedClients();
});

export const getCertificationTimelineFn = createServerFn({ method: "GET" })
  .validator((data) =>
    z
      .object({ clientName: z.string().optional(), certificateId: z.string().optional() })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    requireUser();
    if (!data.clientName && !data.certificateId) return null;
    return getCertificationTimeline(data.clientName ?? "", data.certificateId);
  });
