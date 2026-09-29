export type Status =
  | "current"
  | "transition"
  | "withdrawn"
  | "superseded"
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "open"
  | "review"
  | "blocked"
  | "due";

export interface DocMeta {
  id: string;
  code: string;
  title: string;
  revision: string;
  effective: string;
  status: "current" | "transition" | "withdrawn" | "superseded" | "draft";
  framework: string;
  supersededBy?: string;
  supersedes?: string;
}

export const FRAMEWORKS = [
  {
    id: "17021",
    code: "ISO/IEC 17021-1",
    name: "Management Systems Certification",
    scope: "ISO/IEC 17021-1:2015",
    color: "primary",
  },
  {
    id: "ps4992",
    code: "PS 4992",
    name: "Halal Certification Framework",
    scope: "PS 4992",
    color: "success",
  },
  {
    id: "17024",
    code: "ISO/IEC 17024",
    name: "Certification of Persons",
    scope: "ISO/IEC 17024",
    color: "info",
  },
  {
    id: "17065",
    code: "ISO/IEC 17065",
    name: "Product, Process & Service Certification",
    scope: "ISO/IEC 17065",
    color: "warning",
  },
] as const;

export const DELIVERABLES = [
  {
    id: "prd",
    label: "Product Requirements",
    desc: "The complete PRD governing scope, principles, and acceptance criteria.",
    route: "/prd",
  },
  {
    id: "architecture",
    label: "Architecture Proposal",
    desc: "Multi-tenant, API-first design, ERD overview, and security model.",
    route: "/architecture",
  },
  {
    id: "modules",
    label: "Module Map",
    desc: "How the 28 modules connect across frameworks and portals.",
    route: "/modules",
  },
  {
    id: "roles",
    label: "Role-Permission Matrix",
    desc: "Configurable RBAC/ABAC with segregation-of-duty enforcement.",
    route: "/roles",
  },
  {
    id: "register",
    label: "Clarification Register",
    desc: "Assumptions and the open questions requiring expert confirmation.",
    route: "/register",
  },
  {
    id: "workflows",
    label: "Workflows & Approval",
    desc: "Certification Kanban, NCR flow, document control & central approval.",
    route: "/workflows",
  },
  {
    id: "settings",
    label: "Settings & Builder",
    desc: "Custom fields/objects/tags, email builder, header/footer & export.",
    route: "/settings",
  },
  {
    id: "roadmap",
    label: "Delivery Roadmap",
    desc: "Seven controlled phases with dependencies and acceptance gates.",
    route: "/roadmap",
  },
] as const;

export const MODULES = [
  {
    id: "dashboard",
    name: "Dashboard & Navigation",
    group: "Core",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "crm",
    name: "Client & CRM",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "application",
    name: "Application & Review",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "kanban",
    name: "Certification Project Kanban",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "audit",
    name: "Audit & Assessment Management",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "ncr",
    name: "Nonconformity & Corrective Action",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "decision",
    name: "Certification Decision & Certificates",
    group: "Lifecycle",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "docs",
    name: "Document Control & Central Approval",
    group: "Compliance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "competence",
    name: "Personnel Competence & Authorization",
    group: "Compliance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "internal",
    name: "Internal Management System",
    group: "Compliance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "scheduler",
    name: "Annual Activity Scheduler",
    group: "Compliance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "complaints",
    name: "Complaints, Appeals & Feedback",
    group: "Governance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "kpi",
    name: "KPI & Performance",
    group: "Governance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "resource",
    name: "Resource-Gap Assessment",
    group: "Governance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "training",
    name: "Training Management (Academy)",
    group: "Academy",
    frameworks: ["17024", "ps4992"],
  },
  {
    id: "notifications",
    name: "Notifications & Communications",
    group: "Platform",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "reports",
    name: "Reports & Analytics",
    group: "Platform",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "settings",
    name: "Settings & Administration",
    group: "Platform",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "reglibrary",
    name: "Regulatory Document Library",
    group: "Compliance",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
  {
    id: "org",
    name: "Organization & Multi-Tenant",
    group: "Core",
    frameworks: ["17021", "ps4992", "17024", "17065"],
  },
] as const;

export const CERT_STAGES = [
  "Inquiry received",
  "Application submitted",
  "Application under review",
  "Application approved",
  "Contract & quotation",
  "Audit programme created",
  "Stage 1 planning",
  "Stage 1 completed",
  "Stage 1 findings pending",
  "Stage 2 planning",
  "Stage 2 completed",
  "NCR response required",
  "NCR verification",
  "Technical review",
  "Certification decision",
  "Certificate preparation",
  "Certificate issued",
  "Surveillance due",
  "Recertification due",
  "Closed",
];

export const NCR_STAGES = [
  "Draft finding",
  "Internal review",
  "Issued to responsible party",
  "Correction submitted",
  "Root-cause analysis",
  "Corrective-action plan",
  "Evidence uploaded",
  "Under verification",
  "More information required",
  "Accepted",
  "Effectiveness review due",
  "Closed",
];

export const DOC_WORKFLOW = [
  "Draft",
  "Review",
  "Changes requested",
  "Approval",
  "Published",
  "Periodic review",
  "Revised",
  "Superseded",
  "Archived",
];

export const ROLES = [
  "Super administrator",
  "Chief executive",
  "Certification manager",
  "Scheme manager",
  "Quality manager",
  "Branch manager",
  "Sales officer",
  "Application reviewer",
  "Audit-program manager",
  "Audit team leader",
  "Auditor",
  "Technical expert",
  "Technical reviewer",
  "Independent certification decision-maker",
  "Document controller",
  "Complaint & appeal investigator",
  "Impartiality committee member",
  "Trainer",
  "Examination officer",
  "Finance officer",
  "Client administrator",
  "Client user",
  "Accreditation assessor",
  "Read-only user",
] as const;

export const PERMISSION_MATRIX: Record<
  string,
  Record<string, "full" | "branch" | "read" | "none">
> = {
  "Super administrator": {
    "Org & tenants": "full",
    "Users & roles": "full",
    "Frameworks & schemes": "full",
    "Document control": "full",
    "CRM & applications": "full",
    "Audit programme": "full",
    "Certification decisions": "full",
    "NCR & corrective action": "full",
    "Competence & authorization": "full",
    "Complaints & appeals": "full",
    "KPIs & reports": "full",
    "Settings & integrations": "full",
  },
  "Certification manager": {
    "Org & tenants": "read",
    "Users & roles": "branch",
    "Frameworks & schemes": "read",
    "Document control": "read",
    "CRM & applications": "full",
    "Audit programme": "full",
    "Certification decisions": "none",
    "NCR & corrective action": "full",
    "Competence & authorization": "branch",
    "Complaints & appeals": "branch",
    "KPIs & reports": "full",
    "Settings & integrations": "none",
  },
  "Audit team leader": {
    "Org & tenants": "none",
    "Users & roles": "none",
    "Frameworks & schemes": "read",
    "Document control": "read",
    "CRM & applications": "read",
    "Audit programme": "full",
    "Certification decisions": "none",
    "NCR & corrective action": "branch",
    "Competence & authorization": "read",
    "Complaints & appeals": "none",
    "KPIs & reports": "read",
    "Settings & integrations": "none",
  },
  "Independent certification decision-maker": {
    "Org & tenants": "none",
    "Users & roles": "none",
    "Frameworks & schemes": "read",
    "Document control": "read",
    "CRM & applications": "read",
    "Audit programme": "read",
    "Certification decisions": "full",
    "NCR & corrective action": "read",
    "Competence & authorization": "read",
    "Complaints & appeals": "none",
    "KPIs & reports": "read",
    "Settings & integrations": "none",
  },
  "Document controller": {
    "Org & tenants": "none",
    "Users & roles": "none",
    "Frameworks & schemes": "read",
    "Document control": "full",
    "CRM & applications": "none",
    "Audit programme": "none",
    "Certification decisions": "none",
    "NCR & corrective action": "read",
    "Competence & authorization": "none",
    "Complaints & appeals": "none",
    "KPIs & reports": "read",
    "Settings & integrations": "none",
  },
  "Sales officer": {
    "Org & tenants": "none",
    "Users & roles": "none",
    "Frameworks & schemes": "none",
    "Document control": "none",
    "CRM & applications": "full",
    "Audit programme": "none",
    "Certification decisions": "none",
    "NCR & corrective action": "none",
    "Competence & authorization": "none",
    "Complaints & appeals": "read",
    "KPIs & reports": "read",
    "Settings & integrations": "none",
  },
  "Accreditation assessor": {
    "Org & tenants": "read",
    "Users & roles": "read",
    "Frameworks & schemes": "read",
    "Document control": "read",
    "CRM & applications": "read",
    "Audit programme": "read",
    "Certification decisions": "read",
    "NCR & corrective action": "read",
    "Competence & authorization": "read",
    "Complaints & appeals": "read",
    "KPIs & reports": "read",
    "Settings & integrations": "none",
  },
  "Client user": {
    "Org & tenants": "none",
    "Users & roles": "none",
    "Frameworks & schemes": "none",
    "Document control": "none",
    "CRM & applications": "read",
    "Audit programme": "read",
    "Certification decisions": "none",
    "NCR & corrective action": "branch",
    "Competence & authorization": "none",
    "Complaints & appeals": "branch",
    "KPIs & reports": "none",
    "Settings & integrations": "none",
  },
};

export const REG_LIBRARY: DocMeta[] = [
  {
    id: "d1",
    code: "ISO/IEC 17021-1:2015",
    title: "Management Systems Certification Requirements",
    revision: "1",
    effective: "2015-06-09",
    status: "current",
    framework: "17021",
  },
  {
    id: "d2",
    code: "ISO/IEC 17021-3:2017",
    title: "Quality Management Systems Audit Requirements",
    revision: "3",
    effective: "2017-08-01",
    status: "current",
    framework: "17021",
  },
  {
    id: "d3",
    code: "ISO/IEC 17021-2:2016",
    title: "Environmental Management Systems",
    revision: "2",
    effective: "2016-05-15",
    status: "current",
    framework: "17021",
  },
  {
    id: "d4",
    code: "ISO/IEC TS 17021-10:2018",
    title: "OH&S Management Systems",
    revision: "10",
    effective: "2018-11-01",
    status: "current",
    framework: "17021",
  },
  {
    id: "d5",
    code: "ISO/IEC TS 17021-15:2023",
    title: "AI Management Systems",
    revision: "15",
    effective: "2023-12-01",
    status: "transition",
    framework: "17021",
  },
  {
    id: "d6",
    code: "IAF MD 4:2025",
    title: "Use of ICT in Audits",
    revision: "2025",
    effective: "2025-01-01",
    status: "current",
    framework: "17021",
    supersedes: "IAF MD 4:2018",
  },
  {
    id: "d7",
    code: "IAF MD 4:2018",
    title: "Use of ICT in Audits (legacy)",
    revision: "2018",
    effective: "2018-06-01",
    status: "superseded",
    framework: "17021",
    supersededBy: "IAF MD 4:2025",
  },
  {
    id: "d8",
    code: "IAF MD 23:2023",
    title: "Branch Office Management",
    revision: "2023",
    effective: "2023-07-01",
    status: "current",
    framework: "17021",
  },
  {
    id: "d9",
    code: "ISO/IEC 17024:2012",
    title: "Personnel Certification Requirements",
    revision: "2",
    effective: "2012-07-15",
    status: "current",
    framework: "17024",
  },
  {
    id: "d10",
    code: "ISO/IEC 17065:2012",
    title: "Product Certification Requirements",
    revision: "1",
    effective: "2012-09-15",
    status: "current",
    framework: "17065",
  },
  {
    id: "d11",
    code: "PS 4992",
    title: "Halal Certification Framework",
    revision: "1",
    effective: "2021-03-01",
    status: "current",
    framework: "ps4992",
  },
  {
    id: "d12",
    code: "Global ACI MD 1",
    title: "Mandatory Document 1 (current)",
    revision: "2026",
    effective: "2026-03-01",
    status: "current",
    framework: "17021",
  },
  {
    id: "d13",
    code: "IAF MD 1:2023",
    title: "Mandatory Document 1 (legacy)",
    revision: "2023",
    effective: "2023-01-01",
    status: "transition",
    framework: "17021",
    supersededBy: "Global ACI MD 1",
  },
];

export const REGISTER = [
  {
    q: "Should DigiCB maintain both legacy IAF documents and current Global ACI documents simultaneously with explicit supersession links?",
    a: "Assumed YES. Both retained with effective dates and supersession relationships. IAF ceased operations 1 Jan 2026.",
    owner: "Accreditation expert",
    priority: "high",
  },
  {
    q: "Are PS 4992 Halal categories aligned with OIC/SMIIC sector codes, or locally defined?",
    a: "Assumed locally configurable categories mapped to OIC/SMIIC where applicable.",
    owner: "Halal scheme owner",
    priority: "high",
  },
  {
    q: "Which specific Accreditation Bodies does DigiCB target for read-only assessor portals?",
    a: "To be confirmed per tenant. Assessor portal scoped per accreditation body.",
    owner: "Product owner",
    priority: "medium",
  },
  {
    q: "Is the central approval workflow single-step or multi-stage (review → technical → authorize)?",
    a: "Assumed configurable multi-stage with feedback/request-changes loops.",
    owner: "Quality manager",
    priority: "high",
  },
  {
    q: "Should AI assistance be read-only advisory only, or generate draft findings for human approval?",
    a: "Assumed advisory + draft-generation, never autonomous decisions per spec.",
    owner: "Product owner",
    priority: "high",
  },
  {
    q: "Multi-site sampling formula — adopt IAF MD 1 ceiling or expose as configurable?",
    a: "Assumed configurable with IAF MD 1 / Global ACI successor as defaults.",
    owner: "Accreditation expert",
    priority: "medium",
  },
  {
    q: "Document comparison — server-side render or client-side diff view?",
    a: "Assumed server-side rendered diff with client-side side-by-side viewer.",
    owner: "Engineering",
    priority: "low",
  },
  {
    q: "Should MS Word/Excel/PDF export embed the global header/footer defined in Settings?",
    a: "Assumed YES — header/footer region is universal across all document exports.",
    owner: "Product owner",
    priority: "high",
  },
];

export const PHASES = [
  {
    id: 1,
    name: "Foundation",
    focus: "Authentication, 2FA, organization, branches, roles, permissions, audit logs, settings.",
    deps: "—",
    gates: "2FA enforced; audit log immutable; tenant isolation verified.",
  },
  {
    id: 2,
    name: "Controlled Documents",
    focus:
      "Document lifecycle, approvals, versioning, comparisons, master lists, external standards, central approval.",
    deps: "Phase 1",
    gates: "Every version retrievable; side-by-side compare; approval workflow with feedback loop.",
  },
  {
    id: 3,
    name: "CRM & Certification Lifecycle",
    focus:
      "Clients, applications, review, contracts, projects, Kanban, audit programme, scheduling.",
    deps: "Phase 2",
    gates: "Approved opportunity → project without re-entry; Kanban template per framework.",
  },
  {
    id: 4,
    name: "Audits & Certification Decisions",
    focus:
      "Audit tools, NCRs, technical review, decisions, certificate generation, public verification.",
    deps: "Phase 3",
    gates: "Unauthorized personnel blocked; QR verification public; independence enforced.",
  },
  {
    id: 5,
    name: "Competence & Internal MS",
    focus:
      "Personnel competence, authorization, internal audits, management review, risks, KPIs, scheduler.",
    deps: "Phase 4",
    gates: "Competence matrix blocks assignments; KPIs evidence-based; annual reminders fire.",
  },
  {
    id: 6,
    name: "Complaints, Training & Resource Gaps",
    focus: "Complaints/appeals, Academy, course scheduling, assessments, new-scheme readiness.",
    deps: "Phase 5",
    gates:
      "Independent complaint workflow; training/certification impartiality separated; gap % evidence-based.",
  },
  {
    id: 7,
    name: "Integrations & Advanced Analytics",
    focus:
      "Email, calendars, APIs, webhooks, dashboards, automation, advisory AI, advanced reports.",
    deps: "Phase 6",
    gates: "SMTP configurable; API versioned; no AI autonomous decision; scheduled exports.",
  },
];
