// DigiCB Conformity Engine — server function wrappers (thin RPC).
// IMPORTANT: this file must contain ONLY createServerFn declarations and
// imports. Any runtime helper defined as a sibling here is dropped by the
// tss-serverfn-split transform and throws ReferenceError at runtime, which
// the route catch-blocks swallow → empty pages. Helpers live in imported
// .server.ts modules.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  listFrameworks,
  listStandards,
  listClauses,
  listModuleMappings,
  listEvidence,
  listAssessments,
  calculateCompliance,
  calculateAllCompliance,
  saveAssessment,
  listReassessmentReminders,
  syncReassessmentNotifications,
  regenerateMissingConformityData,
  validateConformityCompleteness,
} from "./conformity-engine.server";
import { currentUser } from "./conformity-auth.server";

export const listFrameworksFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listFrameworks();
});

export const listStandardsFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listStandards();
});

export const listClausesFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listClauses();
});

export const listModuleMappingsFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listModuleMappings();
});

export const listEvidenceFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listEvidence();
});

export const listAssessmentsFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return listAssessments();
});

export const calculateComplianceFn = createServerFn({ method: "GET" })
  .validator((data) => z.object({ frameworkId: z.string().optional() }).parse(data ?? {}))
  .handler(async ({ data }) => {
    currentUser();
    return calculateCompliance(data.frameworkId);
  });

export const calculateAllComplianceFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return calculateAllCompliance();
});

export const listReassessmentRemindersFn = createServerFn({ method: "GET" }).handler(async () => {
  const user = currentUser();
  if (user) syncReassessmentNotifications(user.id);
  return listReassessmentReminders();
});

export const saveAssessmentFn = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        clauseId: z.string(),
        status: z.string(),
        notes: z.string(),
        evidenceIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const user = currentUser();
    if (!user) throw new Error("UNAUTHORIZED");
    return saveAssessment(data.clauseId, data.status, data.notes, data.evidenceIds, user.email);
  });

export const regenerateConformityFn = createServerFn({ method: "POST" }).handler(async () => {
  const user = currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return regenerateMissingConformityData();
});

export const validateConformityFn = createServerFn({ method: "GET" }).handler(async () => {
  currentUser();
  return validateConformityCompleteness();
});
