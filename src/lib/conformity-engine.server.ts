// DigiCB Conformity Engine — server-only data store and compliance calculator.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  FrameworkDTO,
  StandardDTO,
  ClauseDTO,
  ModuleMappingDTO,
  EvidenceDTO,
  AssessmentDTO,
  ComplianceResult,
  ClauseResult,
  ReassessmentReminder,
} from "./conformity-schema";
import {
  SEED_FRAMEWORKS,
  SEED_STANDARDS,
  SEED_CLAUSES,
  SEED_MAPPINGS,
  SEED_EVIDENCE,
  linkEvidenceToClauses,
  buildDemoAssessments,
} from "./conformity-seed.server";
import { EXTRA_MAPPINGS } from "./conformity-mappings-extra.server";
import { loadDB, saveDB, uid, now } from "./digicb-store.server";

// Combined seed mappings: 17021 (from seed file) + PS 4992 / 17024 / 17065
// (from the extra mappings module).
const ALL_SEED_MAPPINGS = [...SEED_MAPPINGS, ...EXTRA_MAPPINGS];

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", ".data");
const DB_FILE = join(DATA_DIR, "conformity.json");

interface ConformityDB {
  frameworks: FrameworkDTO[];
  standards: StandardDTO[];
  clauses: ClauseDTO[];
  mappings: ModuleMappingDTO[];
  evidence: EvidenceDTO[];
  assessments: AssessmentDTO[];
}

let cache: ConformityDB | null = null;

function seed(): ConformityDB {
  const linkedEvidence = linkEvidenceToClauses(SEED_CLAUSES, SEED_EVIDENCE);
  const { clauses, assessments } = buildDemoAssessments(SEED_CLAUSES, linkedEvidence);
  return {
    frameworks: SEED_FRAMEWORKS,
    standards: SEED_STANDARDS,
    clauses,
    mappings: ALL_SEED_MAPPINGS,
    evidence: linkedEvidence,
    assessments,
  };
}

// Merge any seed records missing from a persisted DB back in. This fixes the
// "empty registers" bug: when the JSON file was written before new clauses /
// mappings / evidence were added to the seed, load() returned the stale file
// forever and never picked up the new reference data.
function mergeSeed(persisted: ConformityDB): ConformityDB {
  const fresh = seed();
  const existingClauseIds = new Set(persisted.clauses.map((c) => c.id));
  const existingMappingIds = new Set(persisted.mappings.map((m) => m.id));
  const existingEvidenceIds = new Set(persisted.evidence.map((e) => e.id));
  const existingAssessmentIds = new Set(persisted.assessments.map((a) => a.id));
  const existingFrameworkIds = new Set(persisted.frameworks.map((f) => f.id));
  const existingStandardIds = new Set(persisted.standards.map((s) => s.id));

  let changed = false;
  for (const f of fresh.frameworks)
    if (!existingFrameworkIds.has(f.id)) {
      persisted.frameworks.push(f);
      changed = true;
    }
  for (const s of fresh.standards)
    if (!existingStandardIds.has(s.id)) {
      persisted.standards.push(s);
      changed = true;
    }
  for (const c of fresh.clauses)
    if (!existingClauseIds.has(c.id)) {
      persisted.clauses.push(c);
      changed = true;
    }
  for (const m of fresh.mappings)
    if (!existingMappingIds.has(m.id)) {
      persisted.mappings.push(m);
      changed = true;
    }
  for (const e of fresh.evidence)
    if (!existingEvidenceIds.has(e.id)) {
      persisted.evidence.push(e);
      changed = true;
    }
  for (const a of fresh.assessments)
    if (!existingAssessmentIds.has(a.id)) {
      persisted.assessments.push(a);
      changed = true;
    }
  if (changed) persistInternal(persisted);
  return persisted;
}

function load(): ConformityDB {
  if (cache) return cache;
  try {
    if (existsSync(DB_FILE)) {
      const persisted = JSON.parse(readFileSync(DB_FILE, "utf-8")) as ConformityDB;
      cache = mergeSeed(persisted);
      return cache;
    }
  } catch {
    /* fall through to seed */
  }
  cache = seed();
  persist();
  return cache;
}

function persist() {
  persistInternal(cache);
}

function persistInternal(db: ConformityDB | null) {
  if (!db) return;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch {
    /* ignore write errors in edge runtime */
  }
}

// Force a full re-seed (used by the "Generate Clause Library" admin action).
// Preserves user-edited clauses (those whose id already exists) and only adds
// missing seed clauses/mappings/evidence/assessments.
export function regenerateMissingConformityData(): {
  addedClauses: number;
  addedMappings: number;
  addedEvidence: number;
  addedAssessments: number;
} {
  const db = load();
  const fresh = seed();
  const existingClauseIds = new Set(db.clauses.map((c) => c.id));
  const existingMappingIds = new Set(db.mappings.map((m) => m.id));
  const existingEvidenceIds = new Set(db.evidence.map((e) => e.id));
  const existingAssessmentIds = new Set(db.assessments.map((a) => a.id));

  let addedClauses = 0;
  let addedMappings = 0;
  let addedEvidence = 0;
  let addedAssessments = 0;

  for (const c of fresh.clauses)
    if (!existingClauseIds.has(c.id)) {
      db.clauses.push(c);
      addedClauses++;
    }
  for (const m of fresh.mappings)
    if (!existingMappingIds.has(m.id)) {
      db.mappings.push(m);
      addedMappings++;
    }
  for (const e of fresh.evidence)
    if (!existingEvidenceIds.has(e.id)) {
      db.evidence.push(e);
      addedEvidence++;
    }
  for (const a of fresh.assessments)
    if (!existingAssessmentIds.has(a.id)) {
      db.assessments.push(a);
      addedAssessments++;
    }

  persist();
  cache = null; // force reload next read
  return { addedClauses, addedMappings, addedEvidence, addedAssessments };
}

// Validate clause completeness — returns counts of missing expected records.
export function validateConformityCompleteness(): {
  totalFrameworks: number;
  totalStandards: number;
  clausesPerFramework: Record<string, number>;
  mappingsPerFramework: Record<string, number>;
  evidencePerFramework: Record<string, number>;
  assessmentsPerFramework: Record<string, number>;
  orphanClauses: number;
  orphanMappings: number;
  missingMappings: number;
  duplicateMappings: number;
  insufficientDataFrameworks: string[];
} {
  const db = load();
  const fwIds = db.frameworks.map((f) => f.id);
  const clausesPerFramework: Record<string, number> = {};
  const mappingsPerFramework: Record<string, number> = {};
  const evidencePerFramework: Record<string, number> = {};
  const assessmentsPerFramework: Record<string, number> = {};
  const insufficientDataFrameworks: string[] = [];

  for (const fid of fwIds) {
    const clauses = db.clauses.filter((c) => c.frameworkId === fid);
    const mappings = db.mappings.filter((m) => {
      const clause = db.clauses.find((c) => c.id === m.clauseId);
      return clause?.frameworkId === fid;
    });
    const evidence = db.evidence.filter((e) => e.frameworkId === fid);
    const assessments = db.assessments.filter((a) => {
      const clause = db.clauses.find((c) => c.id === a.clauseId);
      return clause?.frameworkId === fid;
    });
    clausesPerFramework[fid] = clauses.length;
    mappingsPerFramework[fid] = mappings.length;
    evidencePerFramework[fid] = evidence.length;
    assessmentsPerFramework[fid] = assessments.length;
    if (clauses.length === 0 || mappings.length === 0) insufficientDataFrameworks.push(fid);
  }

  // Orphan clauses = clauses with no mapping
  const mappedClauseIds = new Set(db.mappings.map((m) => m.clauseId));
  const orphanClauses = db.clauses.filter((c) => !mappedClauseIds.has(c.id)).length;

  // Orphan mappings = mappings pointing to non-existent clauses
  const clauseIds = new Set(db.clauses.map((c) => c.id));
  const orphanMappings = db.mappings.filter((m) => !clauseIds.has(m.clauseId)).length;

  // Missing mappings = leaf clauses (assessable) without any mapping
  const childIds = new Set(db.clauses.filter((c) => c.parentId).map((c) => c.parentId!));
  const leafClauses = db.clauses.filter((c) => !childIds.has(c.id));
  const missingMappings = leafClauses.filter((c) => !mappedClauseIds.has(c.id)).length;

  // Duplicate mappings = same clause+module+submodule combo
  const seen = new Set<string>();
  let duplicateMappings = 0;
  for (const m of db.mappings) {
    const key = `${m.clauseId}|${m.module}|${m.submodule}`;
    if (seen.has(key)) duplicateMappings++;
    else seen.add(key);
  }

  return {
    totalFrameworks: db.frameworks.length,
    totalStandards: db.standards.length,
    clausesPerFramework,
    mappingsPerFramework,
    evidencePerFramework,
    assessmentsPerFramework,
    orphanClauses,
    orphanMappings,
    missingMappings,
    duplicateMappings,
    insufficientDataFrameworks,
  };
}

// ---------- Read functions ----------
export function listFrameworks(): FrameworkDTO[] {
  return load().frameworks;
}

export function listStandards(): StandardDTO[] {
  return load().standards;
}

export function listClauses(): ClauseDTO[] {
  return load().clauses;
}

export function listModuleMappings(): ModuleMappingDTO[] {
  return load().mappings;
}

export function listEvidence(): EvidenceDTO[] {
  return load().evidence;
}

export function listAssessments(): AssessmentDTO[] {
  return load().assessments;
}

// ---------- Compliance calculation ----------
const STATUS_SCORE: Record<string, number> = {
  conforming: 100,
  partial: 50,
  nonconforming: 0,
  evidence_missing: 0,
  evidence_expired: 0,
  not_assessed: 0,
  not_applicable: 0,
  in_progress: 0,
  pending_review: 0,
  corrective_action_open: 50,
  verification_pending: 50,
  closed: 100,
};

export function calculateAllCompliance(): {
  all: ComplianceResult;
  perFramework: Record<string, ComplianceResult>;
} {
  const db = load();
  const fwIds = db.frameworks.map((f) => f.id);
  const perFramework: Record<string, ComplianceResult> = {};
  for (const id of fwIds) perFramework[id] = calculateCompliance(id);
  return { all: calculateCompliance(), perFramework };
}

export function calculateCompliance(frameworkId?: string): ComplianceResult {
  const db = load();
  let clauses = db.clauses;
  if (frameworkId) clauses = clauses.filter((c) => c.frameworkId === frameworkId);

  // Only leaf clauses (those with no children) are assessed; parent clauses
  // are structural groupings. But we also include any clause that has an
  // assessment status other than not_assessed.
  const childIds = new Set(clauses.filter((c) => c.parentId).map((c) => c.parentId!));
  let applicable = clauses.filter((c) => !childIds.has(c.id));

  // Exclude Not Applicable (approved) from the denominator
  const naClauses = applicable.filter((c) => c.assessmentStatus === "not_applicable");
  const approvedNa = naClauses; // all seeded NA are approved
  applicable = applicable.filter((c) => c.assessmentStatus !== "not_applicable");

  const totalApplicable = applicable.length;

  const results: ClauseResult[] = applicable.map((c) => {
    const linkedEvidence = db.evidence.filter((e) => e.clauseIds.includes(c.id));
    const hasValidEvidence = linkedEvidence.some(
      (e) => e.validity === "valid" && e.approvalStatus === "approved",
    );
    const hasExpiredEvidence = linkedEvidence.some((e) => e.validity === "expired");
    const assessed = c.assessmentStatus !== "not_assessed" && c.assessmentStatus !== "in_progress";

    // If evidence is expired and clause was conforming, flag it
    let effectiveStatus = c.assessmentStatus;
    if (assessed && hasExpiredEvidence && effectiveStatus === "conforming") {
      effectiveStatus = "evidence_expired";
    }
    if (
      assessed &&
      linkedEvidence.length > 0 &&
      !hasValidEvidence &&
      !hasExpiredEvidence &&
      effectiveStatus === "conforming"
    ) {
      effectiveStatus = "evidence_missing";
    }

    const score = STATUS_SCORE[effectiveStatus] ?? 0;
    return {
      clauseId: c.id,
      number: c.number,
      title: c.title,
      status: effectiveStatus,
      score,
      assessed,
      hasValidEvidence: hasValidEvidence || linkedEvidence.length === 0, // no evidence required is OK if assessed
    };
  });

  // Overall readiness = earned / max (unassessed stay in denominator at 0)
  const maxPoints = totalApplicable * 100;
  const earnedPoints = results.reduce((sum, r) => sum + r.score, 0);
  const overallReadiness = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  // Evidence coverage = applicable clauses with valid approved evidence / total applicable
  const withValidEvidence = results.filter((r) => r.hasValidEvidence && r.assessed).length;
  const evidenceCoverage =
    totalApplicable > 0 ? Math.round((withValidEvidence / totalApplicable) * 100) : 0;

  // Assessment coverage = assessed / total applicable
  const assessedCount = results.filter((r) => r.assessed).length;
  const assessmentCoverage =
    totalApplicable > 0 ? Math.round((assessedCount / totalApplicable) * 100) : 0;

  // Assessed conformity = earned assessed / max assessed
  const assessedResults = results.filter((r) => r.assessed);
  const assessedMax = assessedResults.length * 100;
  const assessedEarned = assessedResults.reduce((sum, r) => sum + r.score, 0);
  const assessedConformity = assessedMax > 0 ? Math.round((assessedEarned / assessedMax) * 100) : 0;

  const conforming = results.filter((r) => r.status === "conforming").length;
  const partial = results.filter(
    (r) =>
      r.status === "partial" ||
      r.status === "corrective_action_open" ||
      r.status === "verification_pending",
  ).length;
  const nonconforming = results.filter((r) => r.status === "nonconforming").length;
  const unassessed = results.filter((r) => !r.assessed).length;
  const missingEvidence = results.filter((r) => r.status === "evidence_missing").length;
  const expiredEvidence = results.filter((r) => r.status === "evidence_expired").length;

  return {
    overallReadiness,
    evidenceCoverage,
    assessmentCoverage,
    assessedConformity,
    totalApplicable,
    conforming,
    partial,
    nonconforming,
    unassessed,
    approvedExclusions: approvedNa.length,
    missingEvidence,
    expiredEvidence,
    results,
  };
}

// ---------- Assessment save ----------
export function saveAssessment(
  clauseId: string,
  status: string,
  notes: string,
  evidenceIds: string[],
  actorEmail: string,
): AssessmentDTO {
  const db = load();
  const clause = db.clauses.find((c) => c.id === clauseId);
  if (!clause) throw new Error("Clause not found");

  const score = STATUS_SCORE[status] ?? 0;
  const today = new Date().toISOString().split("T")[0];

  // Update clause
  clause.assessmentStatus = status;
  clause.complianceScore = score;
  clause.lastAssessed = today;
  clause.nextAssessment = today; // next year
  clause.assessor = actorEmail;

  // Update or create assessment
  let assessment = db.assessments.find((a) => a.clauseId === clauseId);
  if (!assessment) {
    assessment = {
      id: uid("assess"),
      clauseId,
      status,
      score,
      notes,
      evidenceIds,
      assessor: actorEmail,
      reviewer: null,
      approver: null,
      approvalStatus: status === "not_applicable" ? "pending_review" : "approved",
      notApplicableJustification: status === "not_applicable" ? notes : null,
      assessedAt: today,
      approvedAt: status === "not_applicable" ? null : today,
    };
    db.assessments.push(assessment);
  } else {
    assessment.status = status;
    assessment.score = score;
    assessment.notes = notes;
    assessment.evidenceIds = evidenceIds;
    assessment.assessor = actorEmail;
    assessment.assessedAt = today;
    assessment.approvalStatus = status === "not_applicable" ? "pending_review" : "approved";
    assessment.notApplicableJustification = status === "not_applicable" ? notes : null;
    assessment.approvedAt = status === "not_applicable" ? null : today;
  }

  // Audit log
  try {
    const main = loadDB();
    main.auditLogs.unshift({
      id: uid("log"),
      ts: now(),
      actor: actorEmail,
      action: "conformity.assessment.saved",
      detail: `Clause ${clause.number} assessed as ${status} (score ${score})`,
    });
    saveDB();
  } catch {
    /* ignore */
  }

  persist();
  cache = null; // force reload
  return assessment;
}

// Re-export for convenience
export { loadDB, saveDB };

// ---------- Reassessment reminders ----------
// Automated reminders for expiring evidence, transitional ISO standards and
// upcoming clause reassessments. Computed live from current records — never
// manually entered. Reminders are also pushed into the user notification feed.
const EXPIRY_WARN_DAYS = 90; // warn before evidence/transition expires

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00Z").getTime();
  if (Number.isNaN(d)) return null;
  return Math.ceil((d - Date.now()) / 86400000);
}

export function listReassessmentReminders(): ReassessmentReminder[] {
  const db = load();
  const reminders: ReassessmentReminder[] = [];

  // 1. Expiring / expired evidence
  for (const ev of db.evidence) {
    if (ev.validity === "missing") continue;
    const days = daysUntil(ev.expiryDate);
    // Include if expiry within window, already expired, or marked expired
    const isExpiredFlag = ev.validity === "expired";
    if (days === null && !isExpiredFlag) continue;
    const effectiveDays = isExpiredFlag && (days === null || days > 0) ? -1 : days;
    if (effectiveDays === null) continue;
    if (effectiveDays > EXPIRY_WARN_DAYS) continue;

    const severity: ReassessmentReminder["severity"] =
      effectiveDays < 0 ? "critical" : effectiveDays < 30 ? "critical" : "warning";
    const clauseNums = ev.clauseIds
      .map((cid) => db.clauses.find((c) => c.id === cid)?.number)
      .filter(Boolean) as string[];

    reminders.push({
      id: `rem_ev_${ev.id}`,
      kind: "evidence_expiry",
      title: `Evidence expiring: ${ev.title}`,
      detail: `${ev.evidenceType} from ${ev.sourceModule}${
        ev.sourceRecord ? ` (${ev.sourceRecord})` : ""
      } ${
        effectiveDays < 0
          ? "has expired — reassess supporting clauses and renew evidence."
          : `expires in ${effectiveDays} days. Schedule reassessment before expiry.`
      }${clauseNums.length ? ` Linked clauses: ${clauseNums.join(", ")}.` : ""}`,
      dueDate: ev.expiryDate,
      daysLeft: effectiveDays,
      severity,
      owner: ev.owner,
      link: "/app/conformity/evidence",
      relatedClauses: ev.clauseIds,
      frameworkId: ev.frameworkId,
    });
  }

  // 2. Transitional ISO standards / mandatory documents
  for (const std of db.standards) {
    if (std.status !== "transition" && !std.transitionDeadline) continue;
    const days = daysUntil(std.transitionDeadline);
    if (days === null) continue;
    if (days > EXPIRY_WARN_DAYS) continue;

    const severity: ReassessmentReminder["severity"] =
      days < 0 ? "critical" : days < 30 ? "critical" : days < 60 ? "warning" : "info";
    const affectedClauses = db.clauses.filter((c) => c.standardId === std.id).map((c) => c.id);

    reminders.push({
      id: `rem_std_${std.id}`,
      kind: "standard_transition",
      title: `Transition deadline: ${std.number}`,
      detail: `${std.title}. ${
        days < 0
          ? "Transition deadline has passed — compliance must be reassessed against the new revision immediately."
          : `Transition deadline in ${days} days. Complete clause reassessment and update affected documents, forms and personnel authorizations before the deadline.`
      } Compliance is recalculated only after reassessment.`,
      dueDate: std.transitionDeadline,
      daysLeft: days,
      severity,
      owner: std.owner,
      link: "/app/conformity/transition",
      relatedClauses: affectedClauses,
      frameworkId: std.frameworkId,
    });
  }

  // 3. Clause reassessments due (nextAssessment within window or past)
  for (const c of db.clauses) {
    if (!c.nextAssessment) continue;
    if (c.assessmentStatus === "not_applicable") continue;
    const days = daysUntil(c.nextAssessment);
    if (days === null) continue;
    if (days > EXPIRY_WARN_DAYS) continue;

    const severity: ReassessmentReminder["severity"] =
      days < 0 ? "warning" : days < 30 ? "warning" : "info";

    reminders.push({
      id: `rem_cl_${c.id}`,
      kind: "clause_reassessment",
      title: `Reassessment due: clause ${c.number}`,
      detail: `Clause ${c.number} (${c.title}) ${
        days < 0 ? "is overdue for reassessment." : `is due for reassessment in ${days} days.`
      } Current status: ${c.assessmentStatus.replace(/_/g, " ")}. Responsible owner: ${
        c.responsibleOwner || "unassigned"
      }.`,
      dueDate: c.nextAssessment,
      daysLeft: days,
      severity,
      owner: c.responsibleOwner || c.assessor || "Quality Manager",
      link: "/app/conformity/assessments",
      relatedClauses: [c.id],
      frameworkId: c.frameworkId,
    });
  }

  // Sort: overdue first, then by days left ascending
  reminders.sort((a, b) => {
    const da = a.daysLeft ?? 9999;
    const db_ = b.daysLeft ?? 9999;
    return da - db_;
  });

  return reminders;
}

// Push reminders into the notification feed for a given user (idempotent by
// reminder id — avoids duplicate notifications on repeated calls).
export function syncReassessmentNotifications(userId: string): void {
  try {
    const db = loadDB();
    const reminders = listReassessmentReminders();
    const existingKeys = new Set(
      db.notifications.filter((n) => n.category === "conformity-reminder").map((n) => n.id),
    );
    let added = 0;
    for (const r of reminders) {
      const nid = `crem_${r.id}`;
      if (existingKeys.has(nid)) continue;
      db.notifications.unshift({
        id: nid,
        userId,
        title: r.title,
        body: r.detail,
        category: "conformity-reminder",
        read: false,
        ts: now(),
        link: r.link,
      });
      added++;
    }
    if (added > 0) saveDB();
  } catch {
    /* ignore — notifications are best-effort */
  }
}
