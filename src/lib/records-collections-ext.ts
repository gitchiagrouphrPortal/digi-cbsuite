// DigiCB collection definitions — extended modules (audits, NCRs, decisions,
// certificates, documents, personnel, internal, complaints, KPIs, resource,
// training). Client-safe (no server imports).
import type { CollectionDef } from "./records-schema";
import { FRAMEWORKS, STANDARDS } from "./records-constants";

const auditStatuses = [
  { value: "planned", label: "Planned", tone: "info" as const },
  { value: "scheduled", label: "Scheduled", tone: "info" as const },
  { value: "in_progress", label: "In Progress", tone: "warning" as const },
  { value: "completed", label: "Completed", tone: "success" as const },
  { value: "report_issued", label: "Report Issued", tone: "success" as const },
  { value: "cancelled", label: "Cancelled", tone: "muted" as const, isClosed: true },
];
const auditTypeOpts = [
  { value: "stage1", label: "Stage 1" },
  { value: "stage2", label: "Stage 2" },
  { value: "surveillance1", label: "Surveillance 1" },
  { value: "surveillance2", label: "Surveillance 2" },
  { value: "recertification", label: "Recertification" },
  { value: "special", label: "Special / Short-notice" },
  { value: "transfer", label: "Transfer Review" },
  { value: "scope_extension", label: "Scope Extension" },
  { value: "transition", label: "Transition Audit" },
  { value: "witnessed", label: "Witnessed Audit" },
];
const modeOpts = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];
export const audits: CollectionDef = {
  key: "audits",
  label: "Audits",
  singular: "Audit",
  numberPrefix: "AUD",
  statuses: auditStatuses,
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.clientName ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Audit Title", type: "text", required: true, listCol: true },
    {
      key: "projectId",
      label: "Project",
      type: "ref",
      refCollection: "projects",
      refLabelKey: "title",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    { key: "clientName", label: "Client", type: "text", listCol: true, filterable: true },
    {
      key: "auditType",
      label: "Audit Type",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: auditTypeOpts,
    },
    { key: "mode", label: "Mode", type: "select", listCol: true, options: modeOpts },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "framework", label: "Framework", type: "select", filterable: true, options: FRAMEWORKS },
    { key: "teamLeader", label: "Team Leader", type: "text", listCol: true },
    { key: "auditors", label: "Audit Team", type: "text", placeholder: "Comma-separated" },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "endDate", label: "End Date", type: "date", listCol: true },
    { key: "duration", label: "Duration (days)", type: "number", listCol: true },
    { key: "siteName", label: "Site / Location", type: "text" },
    { key: "objectives", label: "Audit Objectives", type: "textarea" },
    { key: "criteria", label: "Audit Criteria", type: "textarea" },
    { key: "scope", label: "Audit Scope", type: "textarea" },
    { key: "openingMeeting", label: "Opening Meeting Held", type: "checkbox" },
    { key: "closingMeeting", label: "Closing Meeting Held", type: "checkbox" },
    { key: "reportDate", label: "Report Date", type: "date" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

const ncrStages = [
  { value: "draft", label: "Draft Finding", tone: "muted" as const },
  { value: "internal_review", label: "Under Internal Review", tone: "info" as const },
  { value: "issued", label: "Issued", tone: "info" as const },
  { value: "correction_submitted", label: "Correction Submitted", tone: "warning" as const },
  { value: "root_cause_submitted", label: "Root Cause Submitted", tone: "warning" as const },
  { value: "action_submitted", label: "Corrective Action Submitted", tone: "warning" as const },
  { value: "evidence_uploaded", label: "Evidence Uploaded", tone: "warning" as const },
  { value: "under_verification", label: "Under Verification", tone: "info" as const },
  { value: "more_info", label: "More Information Required", tone: "warning" as const },
  { value: "accepted", label: "Accepted", tone: "success" as const },
  { value: "effectiveness_review", label: "Effectiveness Review Due", tone: "warning" as const },
  { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
  { value: "reopened", label: "Reopened", tone: "danger" as const },
];
const ncrClassOpts = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "observation", label: "Observation" },
  { value: "ofi", label: "Opportunity for Improvement" },
];
const ncrSourceOpts = [
  { value: "stage1", label: "Stage 1 Audit" },
  { value: "stage2", label: "Stage 2 Audit" },
  { value: "surveillance", label: "Surveillance" },
  { value: "recertification", label: "Recertification" },
  { value: "internal_audit", label: "Internal Audit" },
  { value: "complaint", label: "Complaint" },
  { value: "other", label: "Other" },
];
export const ncrs: CollectionDef = {
  key: "ncrs",
  label: "Nonconformities",
  singular: "NCR",
  numberPrefix: "NCR",
  statuses: ncrStages,
  workflow: ncrStages,
  searchableText: (r) =>
    String(r.data.statement ?? "") +
    " " +
    String(r.data.clientName ?? "") +
    " " +
    String(r.data.clause ?? "") +
    " " +
    r.number,
  fields: [
    {
      key: "source",
      label: "Source",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: ncrSourceOpts,
    },
    {
      key: "classification",
      label: "Classification",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: ncrClassOpts,
    },
    { key: "clientName", label: "Client", type: "text", listCol: true, filterable: true },
    {
      key: "projectId",
      label: "Project",
      type: "ref",
      refCollection: "projects",
      refLabelKey: "title",
      refNumberKey: "number",
    },
    {
      key: "auditId",
      label: "Audit",
      type: "ref",
      refCollection: "audits",
      refLabelKey: "title",
      refNumberKey: "number",
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "clause", label: "Clause / Requirement", type: "text", listCol: true },
    { key: "requirement", label: "Requirement", type: "textarea" },
    { key: "evidence", label: "Objective Evidence", type: "textarea" },
    {
      key: "statement",
      label: "Statement of Nonconformity",
      type: "textarea",
      required: true,
      listCol: true,
    },
    { key: "correction", label: "Correction", type: "textarea" },
    { key: "rootCause", label: "Root Cause", type: "textarea" },
    { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
    { key: "owner", label: "Responsible Owner", type: "text", listCol: true },
    { key: "targetDate", label: "Target Date", type: "date", listCol: true, filterable: true },
    { key: "reviewer", label: "Reviewer", type: "text" },
    { key: "verificationMethod", label: "Verification Method", type: "textarea" },
    { key: "effectivenessResult", label: "Effectiveness Result", type: "textarea" },
  ],
};

export const decisions: CollectionDef = {
  key: "decisions",
  label: "Certification Decisions",
  singular: "Decision",
  numberPrefix: "DEC",
  statuses: [
    { value: "pending_review", label: "Pending Technical Review", tone: "warning" as const },
    { value: "reviewed", label: "Technical Review Complete", tone: "info" as const },
    { value: "pending_decision", label: "Pending Decision", tone: "warning" as const },
    { value: "approved", label: "Approved", tone: "success" as const, isClosed: true },
    { value: "rejected", label: "Rejected", tone: "danger" as const, isClosed: true },
    {
      value: "conditions",
      label: "Approved with Conditions",
      tone: "warning" as const,
      isClosed: true,
    },
  ],
  searchableText: (r) =>
    String(r.data.clientName ?? "") + " " + String(r.data.standard ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Decision", type: "text", required: true, listCol: true },
    {
      key: "projectId",
      label: "Project",
      type: "ref",
      refCollection: "projects",
      refLabelKey: "title",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    { key: "clientName", label: "Client", type: "text", listCol: true, filterable: true },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "framework", label: "Framework", type: "select", filterable: true, options: FRAMEWORKS },
    { key: "reviewer", label: "Technical Reviewer", type: "text", listCol: true },
    { key: "decisionMaker", label: "Decision Maker", type: "text", listCol: true },
    { key: "unresolvedFindings", label: "Unresolved Findings", type: "textarea" },
    { key: "scopeConfirmed", label: "Scope Confirmation", type: "textarea" },
    {
      key: "decision",
      label: "Decision",
      type: "select",
      options: [
        { value: "approve", label: "Approve" },
        { value: "reject", label: "Reject" },
        { value: "conditions", label: "Approve with Conditions" },
      ],
    },
    { key: "justification", label: "Justification", type: "textarea", required: true },
    { key: "conditions", label: "Conditions / Limitations", type: "textarea" },
    { key: "approvalDate", label: "Approval Date", type: "date", listCol: true },
  ],
};

export const certificates: CollectionDef = {
  key: "certificates",
  label: "Certificates",
  singular: "Certificate",
  numberPrefix: "CERT",
  statuses: [
    { value: "draft", label: "Draft", tone: "muted" as const },
    { value: "issued", label: "Issued", tone: "success" as const },
    { value: "suspended", label: "Suspended", tone: "danger" as const },
    { value: "withdrawn", label: "Withdrawn", tone: "muted" as const, isClosed: true },
    { value: "expired", label: "Expired", tone: "muted" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.clientName ?? "") +
    " " +
    String(r.data.standard ?? "") +
    " " +
    String(r.data.scope ?? "") +
    " " +
    r.number,
  fields: [
    {
      key: "clientName",
      label: "Client",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    {
      key: "framework",
      label: "Accreditation",
      type: "select",
      listCol: true,
      filterable: true,
      options: FRAMEWORKS,
    },
    { key: "scope", label: "Certification Scope", type: "textarea", required: true, listCol: true },
    { key: "sites", label: "Certified Sites", type: "textarea" },
    {
      key: "issueDate",
      label: "Issue Date",
      type: "date",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "expiryDate",
      label: "Expiry Date",
      type: "date",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "surveillance1Date", label: "Surveillance 1", type: "date" },
    { key: "surveillance2Date", label: "Surveillance 2", type: "date" },
    { key: "recertificationDate", label: "Recertification Date", type: "date" },
    {
      key: "decisionId",
      label: "Decision Ref.",
      type: "ref",
      refCollection: "decisions",
      refLabelKey: "title",
      refNumberKey: "number",
    },
    { key: "markOfAccreditation", label: "Accreditation Mark", type: "text" },
    { key: "notes", label: "Notes / Scope Changes", type: "textarea" },
  ],
};

const docStatuses = [
  { value: "draft", label: "Draft", tone: "muted" as const },
  { value: "review", label: "Under Review", tone: "info" as const },
  { value: "changes_requested", label: "Changes Requested", tone: "warning" as const },
  { value: "approval", label: "Awaiting Approval", tone: "warning" as const },
  { value: "published", label: "Published", tone: "success" as const },
  { value: "periodic_review", label: "Periodic Review", tone: "info" as const },
  { value: "superseded", label: "Superseded", tone: "muted" as const, isClosed: true },
  { value: "archived", label: "Archived", tone: "muted" as const, isClosed: true },
];
const docTypeOpts = [
  { value: "policy", label: "Policy" },
  { value: "procedure", label: "Procedure" },
  { value: "manual", label: "Manual" },
  { value: "work_instruction", label: "Work Instruction" },
  { value: "form", label: "Form" },
  { value: "template", label: "Template" },
  { value: "record", label: "Record" },
  { value: "external", label: "External Document" },
  { value: "standard", label: "Standard" },
];
export const documents: CollectionDef = {
  key: "documents",
  label: "Controlled Documents",
  singular: "Document",
  numberPrefix: "DOC",
  statuses: docStatuses,
  searchableText: (r) =>
    String(r.data.title ?? "") +
    " " +
    String(r.data.docNumber ?? "") +
    " " +
    String(r.data.owner ?? "") +
    " " +
    r.number,
  fields: [
    { key: "title", label: "Document Title", type: "text", required: true, listCol: true },
    {
      key: "docNumber",
      label: "Document Number",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "docType",
      label: "Document Type",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: docTypeOpts,
    },
    {
      key: "framework",
      label: "Framework",
      type: "select",
      listCol: true,
      filterable: true,
      options: FRAMEWORKS,
    },
    { key: "process", label: "Process / Area", type: "text" },
    { key: "owner", label: "Document Owner", type: "text", listCol: true },
    { key: "author", label: "Author", type: "text" },
    { key: "reviewer", label: "Reviewer", type: "text" },
    { key: "approver", label: "Approver", type: "text" },
    { key: "version", label: "Version / Revision", type: "text", listCol: true },
    { key: "effectiveDate", label: "Effective Date", type: "date", listCol: true },
    {
      key: "nextReviewDate",
      label: "Next Review Date",
      type: "date",
      listCol: true,
      filterable: true,
    },
    {
      key: "confidentiality",
      label: "Confidentiality",
      type: "select",
      options: [
        { value: "public", label: "Public" },
        { value: "internal", label: "Internal" },
        { value: "confidential", label: "Confidential" },
        { value: "restricted", label: "Restricted" },
      ],
    },
    { key: "retention", label: "Retention Period", type: "text" },
    { key: "changeSummary", label: "Change Summary", type: "textarea" },
    { key: "relatedClauses", label: "Related Clauses", type: "text" },
    { key: "content", label: "Content", type: "textarea" },
  ],
};

export const personnel: CollectionDef = {
  key: "personnel",
  label: "Personnel",
  singular: "Person",
  numberPrefix: "PERS",
  statuses: [
    { value: "active", label: "Active", tone: "success" as const },
    { value: "suspended", label: "Authorization Suspended", tone: "danger" as const },
    {
      value: "withdrawn",
      label: "Authorization Withdrawn",
      tone: "muted" as const,
      isClosed: true,
    },
    { value: "inactive", label: "Inactive", tone: "muted" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.name ?? "") +
    " " +
    String(r.data.role ?? "") +
    " " +
    String(r.data.sectors ?? "") +
    " " +
    r.number,
  fields: [
    {
      key: "name",
      label: "Full Name",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: [
        { value: "auditor", label: "Auditor" },
        { value: "technical_expert", label: "Technical Expert" },
        { value: "reviewer", label: "Application Reviewer" },
        { value: "tech_reviewer", label: "Technical Reviewer" },
        { value: "decision_maker", label: "Decision-Maker" },
        { value: "trainer", label: "Trainer" },
        { value: "examiner", label: "Examiner" },
        { value: "employee", label: "Employee" },
      ],
    },
    { key: "frameworks", label: "Frameworks", type: "text", placeholder: "Comma-separated" },
    { key: "schemes", label: "Schemes", type: "text" },
    { key: "sectors", label: "Technical Sectors", type: "text", listCol: true, filterable: true },
    { key: "languages", label: "Languages", type: "text" },
    { key: "education", label: "Education", type: "textarea" },
    { key: "qualifications", label: "Qualifications", type: "textarea" },
    { key: "auditExperience", label: "Audit Experience (days)", type: "number" },
    { key: "authorizationScope", label: "Authorization Scope", type: "textarea" },
    { key: "authDate", label: "Authorization Date", type: "date", listCol: true },
    {
      key: "authExpiry",
      label: "Authorization Expiry",
      type: "date",
      listCol: true,
      filterable: true,
    },
    { key: "authApprover", label: "Authorization Approver", type: "text" },
    { key: "cpdHours", label: "CPD Hours", type: "number" },
    { key: "conflictDeclared", label: "Conflict Declaration on File", type: "checkbox" },
  ],
};

export const internalAudits: CollectionDef = {
  key: "internal_audits",
  label: "Internal Audits",
  singular: "Internal Audit",
  numberPrefix: "IA",
  statuses: [
    { value: "planned", label: "Planned", tone: "info" as const },
    { value: "in_progress", label: "In Progress", tone: "warning" as const },
    { value: "completed", label: "Completed", tone: "success" as const },
    { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.area ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Audit Title", type: "text", required: true, listCol: true },
    { key: "area", label: "Area / Process", type: "text", listCol: true, filterable: true },
    { key: "leadAuditor", label: "Lead Auditor", type: "text", listCol: true },
    { key: "auditDate", label: "Audit Date", type: "date", listCol: true, filterable: true },
    { key: "criteria", label: "Audit Criteria", type: "textarea" },
    { key: "findings", label: "Findings Summary", type: "textarea" },
    { key: "reportDate", label: "Report Date", type: "date" },
  ],
};

export const mgmtReviews: CollectionDef = {
  key: "mgmt_reviews",
  label: "Management Reviews",
  singular: "Management Review",
  numberPrefix: "MR",
  statuses: [
    { value: "scheduled", label: "Scheduled", tone: "info" as const },
    { value: "held", label: "Held", tone: "info" as const },
    { value: "actions_open", label: "Actions Open", tone: "warning" as const },
    { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) => String(r.data.title ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Review Title", type: "text", required: true, listCol: true },
    { key: "date", label: "Review Date", type: "date", listCol: true, filterable: true },
    { key: "chair", label: "Chair", type: "text", listCol: true },
    { key: "inputs", label: "Inputs Reviewed", type: "textarea" },
    { key: "decisions", label: "Decisions", type: "textarea" },
    { key: "actions", label: "Action Items", type: "textarea" },
  ],
};

// Risk Management collection is imported from a focused module to keep this
// file maintainable. It carries framework, clause, module linkage and 1–5 scoring.
// (Imported at top of file to avoid circular re-export issues.)

export const complaints: CollectionDef = {
  key: "complaints",
  label: "Complaints",
  singular: "Complaint",
  numberPrefix: "CMP",
  statuses: [
    { value: "new", label: "New", tone: "info" as const },
    { value: "acknowledged", label: "Acknowledged", tone: "info" as const },
    { value: "investigation", label: "Under Investigation", tone: "warning" as const },
    { value: "decision", label: "Decision Made", tone: "info" as const },
    { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.complainant ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Complaint", type: "text", required: true, listCol: true },
    {
      key: "complainant",
      label: "Complainant",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "clientName", label: "Related Client", type: "text", listCol: true },
    {
      key: "category",
      label: "Category",
      type: "select",
      listCol: true,
      filterable: true,
      options: [
        { value: "service", label: "Service Quality" },
        { value: "auditor", label: "Auditor Conduct" },
        { value: "decision", label: "Certification Decision" },
        { value: "fees", label: "Fees" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "severity",
      label: "Severity",
      type: "select",
      listCol: true,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    { key: "description", label: "Description", type: "textarea", required: true },
    { key: "investigator", label: "Investigator", type: "text" },
    { key: "independenceCheck", label: "Independence Verified", type: "checkbox" },
    { key: "finding", label: "Investigation Finding", type: "textarea" },
    { key: "decision", label: "Decision", type: "textarea" },
    { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
    { key: "dateReceived", label: "Date Received", type: "date", listCol: true, filterable: true },
    { key: "dateClosed", label: "Date Closed", type: "date" },
  ],
};

export const appeals: CollectionDef = {
  key: "appeals",
  label: "Appeals",
  singular: "Appeal",
  numberPrefix: "APL",
  statuses: [
    { value: "new", label: "New", tone: "info" as const },
    { value: "acknowledged", label: "Acknowledged", tone: "info" as const },
    { value: "review", label: "Under Review", tone: "warning" as const },
    { value: "decision", label: "Decision Made", tone: "info" as const },
    { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.appellant ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Appeal", type: "text", required: true, listCol: true },
    {
      key: "appellant",
      label: "Appellant",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "relatedDecision", label: "Related Decision", type: "text", listCol: true },
    { key: "grounds", label: "Grounds for Appeal", type: "textarea", required: true },
    { key: "reviewer", label: "Reviewer", type: "text" },
    { key: "independenceCheck", label: "Independence Verified", type: "checkbox" },
    { key: "finding", label: "Review Finding", type: "textarea" },
    { key: "decision", label: "Decision", type: "textarea" },
    { key: "dateReceived", label: "Date Received", type: "date", listCol: true, filterable: true },
    { key: "dateClosed", label: "Date Closed", type: "date" },
  ],
};

export const kpis: CollectionDef = {
  key: "kpis",
  label: "KPIs",
  singular: "KPI",
  numberPrefix: "KPI",
  statuses: [
    { value: "active", label: "Active", tone: "success" as const },
    { value: "review", label: "Due Review", tone: "warning" as const },
    { value: "action", label: "Corrective Action", tone: "danger" as const },
    { value: "closed", label: "Closed", tone: "muted" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.ownerScope ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "KPI", type: "text", required: true, listCol: true },
    {
      key: "ownerScope",
      label: "Scope",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: [
        { value: "employee", label: "Employee" },
        { value: "auditor", label: "Auditor" },
        { value: "department", label: "Department" },
        { value: "process", label: "Process" },
        { value: "branch", label: "Branch" },
        { value: "scheme", label: "Scheme" },
      ],
    },
    { key: "target", label: "Target", type: "text", listCol: true },
    { key: "weighting", label: "Weighting", type: "number" },
    {
      key: "frequency",
      label: "Frequency",
      type: "select",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "annual", label: "Annual" },
      ],
    },
    { key: "actual", label: "Actual Performance", type: "text", listCol: true },
    { key: "score", label: "Score %", type: "number", listCol: true },
    {
      key: "trend",
      label: "Trend",
      type: "select",
      options: [
        { value: "up", label: "Improving" },
        { value: "flat", label: "Stable" },
        { value: "down", label: "Declining" },
      ],
    },
    { key: "owner", label: "Responsible Owner", type: "text", listCol: true },
    { key: "comment", label: "Comment", type: "textarea" },
    { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
  ],
};

export const resourceGaps: CollectionDef = {
  key: "resource_gaps",
  label: "Resource Gap Assessments",
  singular: "Gap Assessment",
  numberPrefix: "RGAP",
  statuses: [
    { value: "assessment", label: "Assessment", tone: "info" as const },
    { value: "action_plan", label: "Action Plan", tone: "warning" as const },
    { value: "ready", label: "Launch Ready", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) => String(r.data.schemeName ?? "") + " " + r.number,
  fields: [
    {
      key: "schemeName",
      label: "New Scheme / Standard",
      type: "text",
      required: true,
      listCol: true,
    },
    {
      key: "framework",
      label: "Framework",
      type: "select",
      listCol: true,
      filterable: true,
      options: FRAMEWORKS,
    },
    {
      key: "criteriaMet",
      label: "Accreditation Criteria Met",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "partial", label: "Partial" },
        { value: "no", label: "No" },
      ],
    },
    {
      key: "docsReady",
      label: "Policies & Procedures",
      type: "select",
      options: [
        { value: "yes", label: "Yes" },
        { value: "partial", label: "Partial" },
        { value: "no", label: "No" },
      ],
    },
    { key: "auditorGap", label: "Auditor / Evaluator Gap", type: "textarea" },
    { key: "expertGap", label: "Technical Expert Gap", type: "textarea" },
    { key: "reviewerGap", label: "Reviewer / Decision-Maker Gap", type: "textarea" },
    { key: "trainerGap", label: "Trainer / Examiner Gap", type: "textarea" },
    { key: "equipmentGap", label: "Equipment / Facility Gap", type: "textarea" },
    { key: "legalGap", label: "Legal / Insurance Gap", type: "textarea" },
    { key: "marketDemand", label: "Market Demand", type: "textarea" },
    { key: "financialFeasibility", label: "Financial Feasibility", type: "textarea" },
    { key: "gapPercent", label: "Gap %", type: "number", listCol: true },
    {
      key: "readinessRating",
      label: "Readiness Rating",
      type: "select",
      listCol: true,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    { key: "targetLaunch", label: "Target Launch Date", type: "date", listCol: true },
    { key: "actionPlan", label: "Action Plan", type: "textarea" },
  ],
};

export const courses: CollectionDef = {
  key: "courses",
  label: "Courses",
  singular: "Course",
  numberPrefix: "CRS",
  statuses: [
    { value: "active", label: "Active", tone: "success" as const },
    { value: "inactive", label: "Inactive", tone: "muted" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.category ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Course Title", type: "text", required: true, listCol: true },
    {
      key: "category",
      label: "Category",
      type: "select",
      listCol: true,
      filterable: true,
      options: [
        { value: "lead_auditor", label: "Lead Auditor" },
        { value: "internal_auditor", label: "Internal Auditor" },
        { value: "awareness", label: "Awareness" },
        { value: "diploma", label: "Diploma" },
        { value: "professional", label: "Professional Certification" },
        { value: "lean_six_sigma", label: "Lean Six Sigma" },
      ],
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    {
      key: "deliveryMode",
      label: "Delivery Mode",
      type: "select",
      options: [
        { value: "online", label: "Online" },
        { value: "classroom", label: "Classroom" },
        { value: "onsite", label: "Onsite" },
        { value: "blended", label: "Blended" },
      ],
    },
    { key: "duration", label: "Duration (hours)", type: "number", listCol: true },
    { key: "cpdHours", label: "CPD Hours", type: "number" },
    { key: "objectives", label: "Learning Objectives", type: "textarea" },
    { key: "syllabus", label: "Syllabus", type: "textarea" },
  ],
};

export const learners: CollectionDef = {
  key: "learners",
  label: "Learners",
  singular: "Learner",
  numberPrefix: "LRN",
  statuses: [
    { value: "active", label: "Active", tone: "success" as const },
    { value: "completed", label: "Completed", tone: "success" as const, isClosed: true },
    { value: "inactive", label: "Inactive", tone: "muted" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.name ?? "") + " " + String(r.data.email ?? "") + " " + r.number,
  fields: [
    {
      key: "name",
      label: "Learner Name",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "organization", label: "Organization", type: "text", listCol: true },
    { key: "enrollments", label: "Enrolled Courses", type: "text" },
    { key: "cpdHours", label: "CPD Hours", type: "number", listCol: true },
  ],
};

export const enrolments: CollectionDef = {
  key: "enrolments",
  label: "Enrolments",
  singular: "Enrolment",
  numberPrefix: "ENR",
  statuses: [
    { value: "enrolled", label: "Enrolled", tone: "info" as const },
    { value: "attended", label: "Attended", tone: "info" as const },
    { value: "examined", label: "Examined", tone: "warning" as const },
    { value: "passed", label: "Passed", tone: "success" as const, isClosed: true },
    { value: "failed", label: "Failed / Retake", tone: "danger" as const },
    { value: "certified", label: "Certified", tone: "success" as const, isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.learnerName ?? "") + " " + String(r.data.courseTitle ?? "") + " " + r.number,
  fields: [
    {
      key: "learnerName",
      label: "Learner",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "courseTitle",
      label: "Course",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "batch", label: "Batch", type: "text", listCol: true },
    { key: "startDate", label: "Start Date", type: "date", listCol: true },
    { key: "examScore", label: "Exam Score %", type: "number", listCol: true },
    { key: "attendance", label: "Attendance %", type: "number" },
    {
      key: "paymentStatus",
      label: "Payment",
      type: "select",
      listCol: true,
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "partial", label: "Partial" },
      ],
    },
    { key: "feedback", label: "Learner Feedback", type: "textarea" },
  ],
};

import { risks } from "./records-risks-collection";
export { risks };
export const EXTENDED_COLLECTIONS: Record<string, CollectionDef> = {
  audits,
  ncrs,
  decisions,
  certificates,
  documents,
  personnel,
  internal_audits: internalAudits,
  mgmt_reviews: mgmtReviews,
  risks,
  complaints,
  appeals,
  kpis,
  resource_gaps: resourceGaps,
  courses,
  learners,
  enrolments,
};
