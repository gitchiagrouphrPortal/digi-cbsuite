// DigiCB certification lifecycle timeline aggregator. Server-only.
// Builds an ordered, traceable flow for a certified client covering every
// process from application through certificate issuance and surveillance.
import { loadRec } from "./records-engine.server";
import type { StoredRecord } from "./records-schema";
export type { TimelineStep, CertificationTimeline } from "./records-timeline-types";

const PROJECT_STAGE_LABELS: Record<string, string> = {
  inquiry: "Inquiry received",
  application_submitted: "Application submitted",
  application_review: "Application review",
  quotation_contract: "Quotation & contract",
  audit_programme: "Audit programme created",
  stage1_planning: "Stage 1 planning",
  stage1_completed: "Stage 1 completed",
  stage1_actions: "Stage 1 actions",
  stage2_planning: "Stage 2 planning",
  stage2_completed: "Stage 2 completed",
  ncr_response: "NCR response",
  ncr_verification: "NCR verification",
  technical_review: "Technical review",
  certification_decision: "Certification decision",
  certificate_preparation: "Certificate preparation",
  certificate_issued: "Certificate issued",
  surveillance: "Surveillance",
  recertification: "Recertification",
  suspended: "Suspended",
  withdrawn: "Withdrawn",
  closed: "Closed",
};

const MILESTONE_PREFIXES = [
  "Application submitted",
  "Application reviewed & approved",
  "Certification agreement signed",
  "Stage 1 completed",
  "Stage 2 completed",
  "NCR verified & closed",
  "Technical review completed",
  "Certification decision",
  "Certificate issued",
  "Certificate suspended",
  "Certificate withdrawn",
];

function isoDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function getCertificationTimeline(
  clientName: string,
  certificateId?: string,
): CertificationTimeline | null {
  const db = loadRec();
  const all = db.records;

  const certs = all.filter(
    (r) => r.collection === "certificates" && String(r.data.clientName) === clientName,
  );
  const cert = certificateId ? (certs.find((c) => c.id === certificateId) ?? certs[0]) : certs[0];
  if (!cert) return null;

  const framework = String(cert.data.framework ?? cert.framework ?? "");
  const standard = String(cert.data.standard ?? "");

  const steps: TimelineStep[] = [];
  let order = 0;
  const push = (s: Omit<TimelineStep, "order" | "id">) => {
    order += 1;
    steps.push({ ...s, order, id: `step_${order}` });
  };

  // 1. Application + review
  const apps = all.filter(
    (r) =>
      r.collection === "applications" &&
      String(r.data.clientName ?? r.data.organizationName) === clientName,
  );
  for (const a of apps) {
    push({
      phase: "Application",
      process: "Application submitted",
      status: a.status,
      actor: a.createdBy,
      role: "Client / Applicant",
      date: a.data.applicationDate ? String(a.data.applicationDate) : isoDate(a.createdAt),
      dateTime: a.createdAt,
      recordNumber: a.number,
      recordCollection: "applications",
      recordId: a.id,
      detail: `${a.data.applicationType ?? "Initial"} — ${a.data.standard ?? ""}`,
      completed: true,
    });
    push({
      phase: "Application Review",
      process: "Application reviewed & approved",
      status: a.status,
      actor: String(a.data.reviewer ?? a.updatedBy),
      role: "Application Reviewer",
      date: isoDate(a.updatedAt),
      dateTime: a.updatedAt,
      recordNumber: a.number,
      recordCollection: "applications",
      recordId: a.id,
      detail:
        a.status === "approved" || a.status === "converted"
          ? "Review approved"
          : `Status: ${a.status}`,
      completed: a.status === "approved" || a.status === "converted",
    });
  }

  // 2. Contract
  const contracts = all.filter(
    (r) =>
      r.collection === "contracts" &&
      (String(r.data.organization) === clientName || String(r.data.clientName) === clientName),
  );
  for (const c of contracts) {
    push({
      phase: "Contract",
      process: "Certification agreement signed",
      status: c.status,
      actor: c.createdBy,
      role: "Sales / Contract Owner",
      date: c.data.signedDate ? String(c.data.signedDate) : isoDate(c.createdAt),
      dateTime: c.createdAt,
      recordNumber: c.number,
      recordCollection: "contracts",
      recordId: c.id,
      detail: String(c.data.title ?? "Certification agreement"),
      completed: c.status === "active",
    });
  }

  // 3. Project stage progression
  const projects = all.filter(
    (r) => r.collection === "projects" && String(r.data.clientName) === clientName,
  );
  for (const p of projects) {
    const stageHistory = p.history.filter(
      (h) => h.action === "Stage moved" || h.action === "Status changed",
    );
    const reached = new Set<string>([p.status]);
    for (const h of stageHistory) if (h.next) reached.add(h.next);
    for (const st of Object.keys(PROJECT_STAGE_LABELS)) {
      if (!reached.has(st)) continue;
      const h = stageHistory.find((x) => x.next === st);
      const ts = h?.ts ?? p.updatedAt;
      push({
        phase: "Certification Project",
        process: PROJECT_STAGE_LABELS[st] ?? st,
        status: st,
        actor: h?.actor ?? p.owner ?? p.updatedBy,
        role: "Project Owner",
        date: isoDate(ts),
        dateTime: ts,
        recordNumber: p.number,
        recordCollection: "projects",
        recordId: p.id,
        detail: String(p.data.title ?? ""),
        completed: true,
      });
    }
  }

  // 4. Audits
  const audits = all.filter(
    (r) => r.collection === "audits" && String(r.data.clientName) === clientName,
  );
  for (const a of audits) {
    const auditTypeLabel =
      a.data.auditType === "stage1"
        ? "Stage 1 audit"
        : a.data.auditType === "stage2"
          ? "Stage 2 audit"
          : a.data.auditType === "surveillance1" || a.data.auditType === "surveillance2"
            ? "Surveillance audit"
            : a.data.auditType === "recertification"
              ? "Recertification audit"
              : "Audit";
    push({
      phase: "Audit",
      process: `${auditTypeLabel} — ${a.status}`,
      status: a.status,
      actor: String(a.data.teamLeader ?? a.createdBy),
      role: "Audit Team Leader",
      date: a.data.startDate ? String(a.data.startDate) : isoDate(a.createdAt),
      dateTime: a.createdAt,
      recordNumber: a.number,
      recordCollection: "audits",
      recordId: a.id,
      detail: `${a.data.mode ?? "onsite"} · ${a.data.duration ?? ""} days · ${a.data.standard ?? ""}`,
      completed: a.status === "completed" || a.status === "report_issued",
    });
    if (a.status === "report_issued" || a.status === "completed") {
      push({
        phase: "Audit",
        process: "Audit report issued",
        status: a.status,
        actor: String(a.data.teamLeader ?? a.updatedBy),
        role: "Audit Team Leader",
        date: a.data.reportDate ? String(a.data.reportDate) : isoDate(a.updatedAt),
        dateTime: a.updatedAt,
        recordNumber: a.number,
        recordCollection: "audits",
        recordId: a.id,
        detail: String(a.data.scope ?? ""),
        completed: true,
      });
    }
  }

  // 5. NCRs
  const ncrs = all.filter(
    (r) => r.collection === "ncrs" && String(r.data.clientName) === clientName,
  );
  for (const n of ncrs) {
    push({
      phase: "Nonconformity",
      process: `NCR ${n.data.classification ?? ""} issued`,
      status: n.status,
      actor: String(n.data.reviewer ?? n.createdBy),
      role: "Auditor / Reviewer",
      date: isoDate(n.createdAt),
      dateTime: n.createdAt,
      recordNumber: n.number,
      recordCollection: "ncrs",
      recordId: n.id,
      detail: `Clause ${n.data.clause ?? ""} — ${String(n.data.statement ?? "").slice(0, 80)}`,
      completed: n.status === "closed",
    });
    if (n.data.correctiveAction) {
      push({
        phase: "Nonconformity",
        process: "Corrective action submitted",
        status: n.status,
        actor: String(n.data.owner ?? n.updatedBy),
        role: "Client / Responsible Owner",
        date: n.data.targetDate ? String(n.data.targetDate) : isoDate(n.updatedAt),
        dateTime: n.updatedAt,
        recordNumber: n.number,
        recordCollection: "ncrs",
        recordId: n.id,
        detail: String(n.data.correctiveAction).slice(0, 100),
        completed: n.status === "closed" || n.status === "accepted",
      });
    }
    if (n.status === "closed") {
      push({
        phase: "Nonconformity",
        process: "NCR verified & closed",
        status: n.status,
        actor: String(n.data.reviewer ?? n.updatedBy),
        role: "Reviewer",
        date: isoDate(n.updatedAt),
        dateTime: n.updatedAt,
        recordNumber: n.number,
        recordCollection: "ncrs",
        recordId: n.id,
        detail: String(n.data.effectivenessResult ?? "Effectiveness verified"),
        completed: true,
      });
    }
  }

  // 6. Technical review & decision
  const decisions = all.filter(
    (r) => r.collection === "decisions" && String(r.data.clientName) === clientName,
  );
  for (const d of decisions) {
    push({
      phase: "Technical Review",
      process: "Technical review completed",
      status: d.status,
      actor: String(d.data.reviewer ?? d.updatedBy),
      role: "Technical Reviewer",
      date: isoDate(d.updatedAt),
      dateTime: d.updatedAt,
      recordNumber: d.number,
      recordCollection: "decisions",
      recordId: d.id,
      detail: String(d.data.scopeConfirmed ?? ""),
      completed: d.status !== "pending_review",
    });
    push({
      phase: "Certification Decision",
      process: `Certification decision — ${d.data.decision ?? d.status}`,
      status: d.status,
      actor: String(d.data.decisionMaker ?? d.updatedBy),
      role: "Independent Decision-Maker",
      date: d.data.approvalDate ? String(d.data.approvalDate) : isoDate(d.updatedAt),
      dateTime: d.updatedAt,
      recordNumber: d.number,
      recordCollection: "decisions",
      recordId: d.id,
      detail: String(d.data.justification ?? ""),
      completed: d.status === "approved" || d.status === "conditions",
    });
  }

  // 7. Certificate issuance
  push({
    phase: "Certificate",
    process: "Certificate issued",
    status: cert.status,
    actor: cert.createdBy,
    role: "Decision-Maker / Document Controller",
    date: cert.data.issueDate ? String(cert.data.issueDate) : isoDate(cert.createdAt),
    dateTime: cert.createdAt,
    recordNumber: cert.number,
    recordCollection: "certificates",
    recordId: cert.id,
    detail: `${cert.data.standard ?? ""} · expires ${cert.data.expiryDate ?? ""} · ${cert.data.markOfAccreditation ?? ""}`,
    completed: cert.status === "issued",
  });

  // 8. Surveillance / recertification / suspension milestones
  if (cert.data.surveillance1Date) {
    push({
      phase: "Surveillance",
      process: "Surveillance 1 due",
      status: "scheduled",
      actor: "—",
      role: "Audit Programme",
      date: String(cert.data.surveillance1Date),
      dateTime: null,
      recordNumber: cert.number,
      recordCollection: "certificates",
      recordId: cert.id,
      detail: "First surveillance audit window",
      completed: false,
    });
  }
  if (cert.data.surveillance2Date) {
    push({
      phase: "Surveillance",
      process: "Surveillance 2 due",
      status: "scheduled",
      actor: "—",
      role: "Audit Programme",
      date: String(cert.data.surveillance2Date),
      dateTime: null,
      recordNumber: cert.number,
      recordCollection: "certificates",
      recordId: cert.id,
      detail: "Second surveillance audit window",
      completed: false,
    });
  }
  if (cert.data.recertificationDate) {
    push({
      phase: "Recertification",
      process: "Recertification due",
      status: "scheduled",
      actor: "—",
      role: "Audit Programme",
      date: String(cert.data.recertificationDate),
      dateTime: null,
      recordNumber: cert.number,
      recordCollection: "certificates",
      recordId: cert.id,
      detail: "Recertification window before expiry",
      completed: false,
    });
  }
  if (cert.status === "suspended") {
    push({
      phase: "Suspension",
      process: "Certificate suspended",
      status: "suspended",
      actor: cert.updatedBy,
      role: "Decision-Maker",
      date: isoDate(cert.updatedAt),
      dateTime: cert.updatedAt,
      recordNumber: cert.number,
      recordCollection: "certificates",
      recordId: cert.id,
      detail: String(cert.data.notes ?? ""),
      completed: true,
    });
  }
  if (cert.status === "withdrawn") {
    push({
      phase: "Withdrawal",
      process: "Certificate withdrawn",
      status: "withdrawn",
      actor: cert.updatedBy,
      role: "Decision-Maker",
      date: isoDate(cert.updatedAt),
      dateTime: cert.updatedAt,
      recordNumber: cert.number,
      recordCollection: "certificates",
      recordId: cert.id,
      detail: String(cert.data.notes ?? ""),
      completed: true,
    });
  }

  // Sort chronologically; dateTime first, then date string.
  steps.sort((a, b) => {
    const ta = a.dateTime ?? (a.date ? Date.parse(a.date) : 0);
    const tb = b.dateTime ?? (b.date ? Date.parse(b.date) : 0);
    return ta - tb;
  });
  steps.forEach((s, i) => (s.order = i + 1));

  const milestones = steps.filter((s) => MILESTONE_PREFIXES.some((m) => s.process.startsWith(m)));

  return {
    clientName,
    clientId: String(cert.data.clientId ?? "") || null,
    framework: framework || null,
    standard: standard || null,
    certificateNumber: cert.number,
    certificateStatus: cert.status,
    steps,
    milestones,
  };
}

// List all certified clients (those with at least one certificate) for the
// register-style selector on the timeline page.
export interface CertifiedClientSummary {
  clientName: string;
  certificateCount: number;
  frameworks: string[];
  standards: string[];
  latestCertificateNumber: string;
  latestCertificateId: string;
  latestStatus: string;
  issueDate: string | null;
}

export function listCertifiedClients(): CertifiedClientSummary[] {
  const db = loadRec();
  const certs = db.records.filter((r) => r.collection === "certificates");
  const byClient = new Map<string, StoredRecord[]>();
  for (const c of certs) {
    const name = String(c.data.clientName ?? "");
    if (!name) continue;
    if (!byClient.has(name)) byClient.set(name, []);
    byClient.get(name)!.push(c);
  }
  const out: CertifiedClientSummary[] = [];
  for (const [clientName, list] of byClient) {
    const latest = list.sort((a, b) => b.createdAt - a.createdAt)[0];
    out.push({
      clientName,
      certificateCount: list.length,
      frameworks: [...new Set(list.map((c) => String(c.data.framework ?? "")).filter(Boolean))],
      standards: [...new Set(list.map((c) => String(c.data.standard ?? "")).filter(Boolean))],
      latestCertificateNumber: latest.number,
      latestCertificateId: latest.id,
      latestStatus: latest.status,
      issueDate: latest.data.issueDate ? String(latest.data.issueDate) : null,
    });
  }
  out.sort((a, b) => a.clientName.localeCompare(b.clientName));
  return out;
}
