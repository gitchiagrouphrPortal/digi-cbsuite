// DigiCB expanded internal-audit and management-review seed records spanning
// all four accreditation frameworks (server-only). Kept in a focused module so
// the main seed file stays maintainable.
import type { StoredRecord } from "./records-schema";

function rec(
  collection: string,
  number: string,
  status: string,
  owner: string,
  data: Record<string, unknown>,
  daysAgo: number,
): StoredRecord {
  const ts = Date.now() - daysAgo * 86400000;
  return {
    id: `seed_${collection}_${number}`,
    number,
    collection,
    status,
    owner,
    ownerId: null,
    branchId: "br_ho",
    framework: data.framework ? String(data.framework) : null,
    data,
    archived: false,
    demo: true,
    createdBy: "system",
    createdById: "system",
    createdAt: ts,
    updatedBy: "system",
    updatedAt: ts,
    comments: [],
    attachments: [],
    history: [{ id: `h_${number}`, actor: "system", action: "Demo record seeded", ts }],
  };
}

export function seedInternalExpanded(): StoredRecord[] {
  return [
    // ---------- Internal Audits (all 4 frameworks) ----------
    rec(
      "internal_audits",
      "IA-2026-0001",
      "completed",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Application Review Process (17021)",
        area: "Applications",
        leadAuditor: "Fatima Zahra",
        auditDate: "2026-06-10",
        criteria: "ISO/IEC 17021-1:2015 clause 9.1.2; PR-003",
        findings: "1 minor: checklist detail could be improved.",
        reportDate: "2026-06-15",
      },
      100,
    ),
    rec(
      "internal_audits",
      "IA-2026-0002",
      "planned",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Certification Decisions (17021)",
        area: "Decisions",
        leadAuditor: "Imran Sheikh",
        auditDate: "2026-11-05",
        criteria: "ISO/IEC 17021-1:2015 clause 9.5",
        findings: "",
        reportDate: "",
      },
      50,
    ),
    rec(
      "internal_audits",
      "IA-2026-0003",
      "in_progress",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Document Control (17021)",
        area: "Documents",
        leadAuditor: "Fatima Zahra",
        auditDate: "2026-09-18",
        criteria: "ISO/IEC 17021-1:2015 clause 10.2.3",
        findings: "",
        reportDate: "",
      },
      2,
    ),
    rec(
      "internal_audits",
      "IA-2026-0004",
      "completed",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Halal Application & Sampling (PS 4992)",
        area: "Halal Certification",
        leadAuditor: "Imran Sheikh",
        auditDate: "2026-07-22",
        criteria: "PS 4992 / OIC-SMIIC 2:2019 — application, sampling, inspection",
        findings:
          "1 minor: sampling plan template needs category-specific refinement. 1 OFI: strengthen Islamic-affairs expert authorization records.",
        reportDate: "2026-07-30",
      },
      70,
    ),
    rec(
      "internal_audits",
      "IA-2026-0005",
      "planned",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Halal Mark Control & Traceability (PS 4992)",
        area: "Halal Certification",
        leadAuditor: "Fatima Zahra",
        auditDate: "2026-12-10",
        criteria: "PS 4992 — Halal marks, traceability, surveillance",
        findings: "",
        reportDate: "",
      },
      40,
    ),
    rec(
      "internal_audits",
      "IA-2026-0006",
      "in_progress",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Examination Security & Examiner Authorization (17024)",
        area: "Personnel Certification",
        leadAuditor: "Imran Sheikh",
        auditDate: "2026-09-25",
        criteria: "ISO/IEC 17024 — examiners, examination security, candidate identity",
        findings: "",
        reportDate: "",
      },
      3,
    ),
    rec(
      "internal_audits",
      "IA-2026-0007",
      "completed",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Scheme Development & Recertification (17024)",
        area: "Personnel Certification",
        leadAuditor: "Fatima Zahra",
        auditDate: "2026-05-14",
        criteria: "ISO/IEC 17024 — scheme review, recertification, appeals",
        findings:
          "1 major: recertification criteria not consistently applied across schemes. 2 minor: scheme review overdue for PERS-01.",
        reportDate: "2026-05-20",
      },
      130,
    ),
    rec(
      "internal_audits",
      "IA-2026-0008",
      "planned",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Product Sampling & Lab Control (17065)",
        area: "Product Certification",
        leadAuditor: "Imran Sheikh",
        auditDate: "2026-11-20",
        criteria: "ISO/IEC 17065 — sampling, evaluation, external laboratories",
        findings: "",
        reportDate: "",
      },
      30,
    ),
    rec(
      "internal_audits",
      "IA-2026-0009",
      "in_progress",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Product Surveillance & Change Control (17065)",
        area: "Product Certification",
        leadAuditor: "Fatima Zahra",
        auditDate: "2026-09-28",
        criteria: "ISO/IEC 17065 — surveillance, changes affecting certification",
        findings: "",
        reportDate: "",
      },
      1,
    ),
    rec(
      "internal_audits",
      "IA-2026-0010",
      "completed",
      "q.mgr@digicb.test",
      {
        title: "Internal Audit — Impartiality & Branch Control (All Frameworks)",
        area: "Impartiality / Branches",
        leadAuditor: "Imran Sheikh",
        auditDate: "2026-04-08",
        criteria: "ISO/IEC 17021-1 cl 4.2/5.2/6.2; IAF MD 23; cross-framework impartiality",
        findings:
          "1 minor: branch KPI review frequency not aligned with IAF MD 23. 1 OFI: harmonize impartiality declarations across all four frameworks.",
        reportDate: "2026-04-15",
      },
      170,
    ),

    // ---------- Management Reviews (all 4 frameworks) ----------
    rec(
      "mgmt_reviews",
      "MR-2026-0001",
      "actions_open",
      "ceo@digicb.test",
      {
        title: "Management Review 2026 Q2 — Management Systems (17021)",
        date: "2026-07-01",
        chair: "Khaled Mansour",
        inputs:
          "17021 audit results, complaints, NCR trends, accreditation feedback, KPIs, resource gaps, IAF MD transition status.",
        decisions: "Approve new ISMS scheme launch; enhance branch oversight.",
        actions:
          "1. Launch ISMS scheme by Q4 (owner: Certification Manager, due 2026-12-31). 2. Branch KPI review quarterly (owner: Quality Manager).",
      },
      80,
    ),
    rec(
      "mgmt_reviews",
      "MR-2026-0002",
      "scheduled",
      "ceo@digicb.test",
      {
        title: "Management Review 2026 Q4 — Organization-wide",
        date: "2026-12-15",
        chair: "Khaled Mansour",
        inputs: "",
        decisions: "",
        actions: "",
      },
      90,
    ),
    rec(
      "mgmt_reviews",
      "MR-2026-0003",
      "closed",
      "ceo@digicb.test",
      {
        title: "Management Review 2026 Q1 — Halal Certification (PS 4992)",
        date: "2026-03-20",
        chair: "Khaled Mansour",
        inputs:
          "PS 4992 Halal audit results, sampling findings, Islamic-affairs expert competence, supplier evaluation, complaint trends.",
        decisions:
          "Approve Halal category expansion; strengthen sampling procedure; recruit second Islamic-affairs expert.",
        actions:
          "1. Expand Halal categories (owner: Halal Scheme Manager, due 2026-06-30 — DONE). 2. Update sampling procedure PR-HAL-04 (owner: Quality Manager — DONE). 3. Recruit Islamic-affairs expert (owner: HR — IN PROGRESS).",
      },
      180,
    ),
    rec(
      "mgmt_reviews",
      "MR-2026-0004",
      "actions_open",
      "ceo@digicb.test",
      {
        title: "Management Review 2026 Q3 — Personnel Certification (17024)",
        date: "2026-09-10",
        chair: "Khaled Mansour",
        inputs:
          "17024 scheme review status, examiner authorizations, examination security audit (IA-2026-0006), recertification compliance, candidate complaints.",
        decisions:
          "Address major NCR on recertification consistency; tighten examination material security; expedite PERS-01 scheme review.",
        actions:
          "1. Revise recertification procedure (owner: Personnel Scheme Manager, due 2026-11-15). 2. Implement examination lock-down protocol (owner: Examination Officer, due 2026-10-31). 3. Complete PERS-01 scheme review (owner: Personnel Scheme Manager, due 2026-12-01).",
      },
      10,
    ),
    rec(
      "mgmt_reviews",
      "MR-2026-0005",
      "scheduled",
      "ceo@digicb.test",
      {
        title: "Management Review 2026 Q4 — Product Certification (17065)",
        date: "2026-12-20",
        chair: "Khaled Mansour",
        inputs:
          "17065 evaluation results, lab competence, surveillance coverage, product-change handling, suspension/withdrawal actions.",
        decisions: "",
        actions: "",
      },
      95,
    ),
  ];
}
