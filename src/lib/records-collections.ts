// DigiCB collection definitions: field schemas, statuses, workflows and the
// searchable-text function per collection. Client-safe (no server imports).
import type { CollectionDef } from "./records-schema";
import { FRAMEWORKS, STANDARDS, BRANCH_OPTS, REVIEWER_OPTS } from "./records-constants";
export { FRAMEWORKS, STANDARDS, BRANCH_OPTS, REVIEWER_OPTS };

const applicationStatuses = [
  { value: "draft", label: "Draft", tone: "muted" as const },
  { value: "submitted", label: "Submitted", tone: "info" as const },
  { value: "under_review", label: "Under Review", tone: "info" as const },
  { value: "more_info", label: "More Info Required", tone: "warning" as const },
  { value: "resource_review", label: "Resource Review", tone: "info" as const },
  { value: "conflict_check", label: "Conflict Check", tone: "warning" as const },
  { value: "approved", label: "Approved", tone: "success" as const },
  { value: "rejected", label: "Rejected", tone: "danger" as const },
  { value: "converted", label: "Converted to Project", tone: "success" as const, isClosed: true },
  { value: "archived", label: "Archived", tone: "muted" as const, isClosed: true },
];

export const applications: CollectionDef = {
  key: "applications",
  label: "Applications",
  singular: "Application",
  numberPrefix: "APP",
  statuses: applicationStatuses,
  searchableText: (r) =>
    String(r.data.clientName ?? "") +
    " " +
    String(r.data.organizationName ?? "") +
    " " +
    String(r.data.standard ?? "") +
    " " +
    String(r.data.scope ?? "") +
    " " +
    r.number,
  fields: [
    {
      key: "applicationDate",
      label: "Application Date",
      type: "date",
      required: true,
      listCol: true,
      filterable: true,
    },
    {
      key: "applicationType",
      label: "Application Type",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: [
        { value: "initial", label: "Initial certification" },
        { value: "recertification", label: "Recertification" },
        { value: "transfer", label: "Transfer" },
        { value: "scope_extension", label: "Scope extension" },
        { value: "surveillance", label: "Surveillance" },
      ],
    },
    {
      key: "serviceType",
      label: "Service Type",
      type: "select",
      required: true,
      options: [
        { value: "management_system", label: "Management system certification" },
        { value: "personnel", label: "Personnel certification" },
        { value: "product", label: "Product certification" },
        { value: "halal", label: "Halal certification" },
        { value: "inspection", label: "Inspection" },
        { value: "training", label: "Training" },
      ],
    },
    {
      key: "framework",
      label: "Accreditation Framework",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: FRAMEWORKS,
    },
    {
      key: "standard",
      label: "Certification Standard",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    {
      key: "scheme",
      label: "Certification Scheme",
      type: "text",
      placeholder: "e.g. QMS, ISMS, FSMS",
    },
    {
      key: "reviewer",
      label: "Assigned Reviewer",
      type: "select",
      listCol: true,
      options: REVIEWER_OPTS,
    },
    {
      key: "branchId",
      label: "Responsible Branch",
      type: "select",
      listCol: true,
      filterable: true,
      options: BRANCH_OPTS,
    },
    {
      key: "clientId",
      label: "Existing Client",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      help: "Select an existing client or create a new one below.",
    },
    {
      key: "organizationName",
      label: "Legal Organization Name",
      type: "text",
      required: true,
      listCol: true,
    },
    { key: "tradingName", label: "Trading Name", type: "text" },
    { key: "registrationNo", label: "Registration Number", type: "text" },
    { key: "taxNumber", label: "Tax Number", type: "text" },
    { key: "website", label: "Website", type: "text" },
    { key: "mainContact", label: "Main Contact", type: "text" },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "address", label: "Address", type: "text" },
    { key: "country", label: "Country", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "scope", label: "Requested Scope", type: "textarea", required: true, listCol: true },
    { key: "productsServices", label: "Products, Services & Processes", type: "textarea" },
    { key: "employees", label: "Number of Employees", type: "number", listCol: true },
    { key: "shifts", label: "Number of Shifts", type: "number" },
    { key: "sites", label: "Number of Sites", type: "number" },
    { key: "outsourced", label: "Outsourced Processes", type: "textarea" },
    { key: "existingCerts", label: "Existing Certifications", type: "textarea" },
    { key: "previousBody", label: "Previous Certification Body", type: "text" },
    { key: "transfer", label: "Transfer Application", type: "checkbox" },
    { key: "integrated", label: "Integrated Management System", type: "checkbox" },
    { key: "remote", label: "Remote Activities", type: "checkbox" },
    { key: "regulatory", label: "Regulatory Requirements", type: "textarea" },
    { key: "preferredDates", label: "Preferred Audit Dates", type: "text" },
    {
      key: "language",
      label: "Certification Language",
      type: "text",
      placeholder: "e.g. English, Arabic",
    },
    {
      key: "technicalSector",
      label: "Technical Sector",
      type: "text",
      listCol: true,
      filterable: true,
      placeholder: "e.g. Food, ICT, Construction",
    },
    { key: "iafCode", label: "IAF/EA/NACE Code", type: "text" },
    {
      key: "riskCategory",
      label: "Risk Category",
      type: "select",
      listCol: true,
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    {
      key: "complexity",
      label: "Process Complexity",
      type: "select",
      options: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    { key: "multiSite", label: "Multi-site", type: "checkbox" },
    { key: "seasonal", label: "Seasonal Activities", type: "checkbox" },
    { key: "auditDuration", label: "Audit Duration (days)", type: "number" },
    { key: "specialCompetence", label: "Special Competence Requirements", type: "textarea" },
    {
      key: "declarationAccepted",
      label: "Accuracy Declaration Accepted",
      type: "checkbox",
      required: true,
    },
    {
      key: "confidentialityAccepted",
      label: "Confidentiality Acknowledged",
      type: "checkbox",
      required: true,
    },
    { key: "conflictInfo", label: "Conflict-of-Interest Information", type: "textarea" },
    { key: "authorizedRep", label: "Authorized Representative", type: "text" },
    { key: "declarationDate", label: "Declaration Date", type: "date" },
  ],
};

export const clients: CollectionDef = {
  key: "clients",
  label: "Organizations",
  singular: "Organization",
  numberPrefix: "ORG",
  statuses: [
    { value: "lead", label: "Lead", tone: "info" },
    { value: "qualified", label: "Qualified", tone: "info" },
    { value: "active", label: "Active Client", tone: "success" },
    { value: "inactive", label: "Inactive", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.organizationName ?? "") + " " + String(r.data.legalName ?? "") + " " + r.number,
  fields: [
    {
      key: "organizationName",
      label: "Legal Organization Name",
      type: "text",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "tradingName", label: "Trading Name", type: "text", listCol: true },
    { key: "registrationNo", label: "Registration No.", type: "text" },
    { key: "taxNumber", label: "Tax No.", type: "text" },
    { key: "website", label: "Website", type: "text" },
    {
      key: "email",
      label: "Main Email",
      type: "email",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "address", label: "Address", type: "text" },
    { key: "country", label: "Country", type: "text", listCol: true, filterable: true },
    { key: "city", label: "City", type: "text", listCol: true },
    { key: "industry", label: "Industry", type: "text", filterable: true },
    { key: "headcount", label: "Headcount", type: "number" },
    { key: "existingCerts", label: "Existing Certifications", type: "textarea" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const leads: CollectionDef = {
  key: "leads",
  label: "Leads & Inquiries",
  singular: "Lead",
  numberPrefix: "LD",
  statuses: [
    { value: "new", label: "New", tone: "info" },
    { value: "contacted", label: "Contacted", tone: "info" },
    { value: "qualified", label: "Qualified", tone: "warning" },
    { value: "converted", label: "Converted", tone: "success", isClosed: true },
    { value: "lost", label: "Lost", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.contact ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Lead Title", type: "text", required: true, listCol: true },
    { key: "organization", label: "Organization", type: "text", listCol: true, filterable: true },
    { key: "contact", label: "Contact Person", type: "text", listCol: true },
    { key: "email", label: "Email", type: "email", listCol: true },
    { key: "phone", label: "Phone", type: "tel" },
    {
      key: "source",
      label: "Source",
      type: "select",
      filterable: true,
      options: [
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "event", label: "Event" },
        { value: "outbound", label: "Outbound" },
      ],
    },
    {
      key: "standard",
      label: "Interested Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "value", label: "Estimated Value", type: "number" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const contacts: CollectionDef = {
  key: "contacts",
  label: "Client Contacts",
  singular: "Contact",
  numberPrefix: "CT",
  statuses: [
    { value: "active", label: "Active", tone: "success" },
    { value: "inactive", label: "Inactive", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.name ?? "") + " " + String(r.data.organization ?? "") + " " + r.number,
  fields: [
    { key: "name", label: "Contact Name", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    { key: "role", label: "Role / Title", type: "text", listCol: true },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
      listCol: true,
      filterable: true,
    },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "decisionMaker", label: "Decision Maker", type: "checkbox" },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const sites: CollectionDef = {
  key: "sites",
  label: "Client Sites",
  singular: "Site",
  numberPrefix: "STE",
  statuses: [
    { value: "active", label: "Active", tone: "success" },
    { value: "inactive", label: "Inactive", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.name ?? "") +
    " " +
    String(r.data.organization ?? "") +
    " " +
    String(r.data.city ?? "") +
    " " +
    r.number,
  fields: [
    { key: "name", label: "Site Name", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    { key: "address", label: "Address", type: "text" },
    { key: "city", label: "City", type: "text", listCol: true },
    { key: "country", label: "Country", type: "text", listCol: true, filterable: true },
    { key: "headcount", label: "Headcount", type: "number" },
    { key: "shifts", label: "Shifts", type: "number" },
    { key: "processes", label: "Processes at Site", type: "textarea" },
  ],
};

export const opportunities: CollectionDef = {
  key: "opportunities",
  label: "Opportunities",
  singular: "Opportunity",
  numberPrefix: "OPP",
  statuses: [
    { value: "open", label: "Open", tone: "info" },
    { value: "quoted", label: "Quoted", tone: "warning" },
    { value: "won", label: "Won", tone: "success", isClosed: true },
    { value: "lost", label: "Lost", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.organization ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Opportunity", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "framework", label: "Framework", type: "select", filterable: true, options: FRAMEWORKS },
    { key: "value", label: "Value", type: "number", listCol: true },
    {
      key: "stage",
      label: "Stage",
      type: "select",
      options: [
        { value: "qualifying", label: "Qualifying" },
        { value: "proposal", label: "Proposal" },
        { value: "negotiation", label: "Negotiation" },
      ],
    },
    { key: "expectedClose", label: "Expected Close", type: "date", listCol: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const quotations: CollectionDef = {
  key: "quotations",
  label: "Quotations",
  singular: "Quotation",
  numberPrefix: "QT",
  statuses: [
    { value: "draft", label: "Draft", tone: "muted" },
    { value: "sent", label: "Sent", tone: "info" },
    { value: "accepted", label: "Accepted", tone: "success", isClosed: true },
    { value: "expired", label: "Expired", tone: "muted", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.organization ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Quotation", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "auditDays", label: "Audit Days", type: "number", listCol: true },
    { key: "amount", label: "Amount", type: "number", listCol: true },
    { key: "currency", label: "Currency", type: "text", placeholder: "USD" },
    { key: "validUntil", label: "Valid Until", type: "date", listCol: true },
    { key: "notes", label: "Notes", type: "textarea" },
  ],
};

export const contracts: CollectionDef = {
  key: "contracts",
  label: "Contracts",
  singular: "Contract",
  numberPrefix: "CTR",
  statuses: [
    { value: "draft", label: "Draft", tone: "muted" },
    { value: "pending_signature", label: "Pending Signature", tone: "warning" },
    { value: "active", label: "Active", tone: "success" },
    { value: "expired", label: "Expired", tone: "muted", isClosed: true },
    { value: "terminated", label: "Terminated", tone: "danger", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.title ?? "") + " " + String(r.data.organization ?? "") + " " + r.number,
  fields: [
    { key: "title", label: "Contract", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    { key: "signedDate", label: "Signed Date", type: "date", listCol: true },
    { key: "validFrom", label: "Valid From", type: "date" },
    { key: "validTo", label: "Valid To", type: "date", listCol: true },
    { key: "value", label: "Contract Value", type: "number", listCol: true },
    { key: "terms", label: "Terms & Conditions", type: "textarea" },
  ],
};

export const communications: CollectionDef = {
  key: "communications",
  label: "Communication History",
  singular: "Communication",
  numberPrefix: "COM",
  statuses: [{ value: "logged", label: "Logged", tone: "info" }],
  searchableText: (r) =>
    String(r.data.subject ?? "") + " " + String(r.data.organization ?? "") + " " + r.number,
  fields: [
    { key: "subject", label: "Subject", type: "text", required: true, listCol: true },
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    {
      key: "channel",
      label: "Channel",
      type: "select",
      listCol: true,
      options: [
        { value: "email", label: "Email" },
        { value: "phone", label: "Phone" },
        { value: "meeting", label: "Meeting" },
        { value: "visit", label: "Site Visit" },
      ],
    },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      options: [
        { value: "inbound", label: "Inbound" },
        { value: "outbound", label: "Outbound" },
      ],
    },
    { key: "date", label: "Date", type: "date", listCol: true },
    { key: "summary", label: "Summary", type: "textarea", required: true },
    { key: "followUp", label: "Follow-up Required", type: "checkbox" },
  ],
};

export const feedback: CollectionDef = {
  key: "feedback",
  label: "Client Feedback",
  singular: "Feedback",
  numberPrefix: "FB",
  statuses: [
    { value: "new", label: "New", tone: "info" },
    { value: "reviewed", label: "Reviewed", tone: "success", isClosed: true },
  ],
  searchableText: (r) =>
    String(r.data.organization ?? "") + " " + String(r.data.comment ?? "") + " " + r.number,
  fields: [
    {
      key: "organization",
      label: "Organization",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
      listCol: true,
      filterable: true,
    },
    { key: "rating", label: "Rating (1-5)", type: "number", listCol: true },
    { key: "comment", label: "Comment", type: "textarea", required: true },
    { key: "date", label: "Date", type: "date", listCol: true },
    { key: "responded", label: "Responded", type: "checkbox" },
  ],
};

const projectStages = [
  { value: "inquiry", label: "Inquiry", tone: "muted" as const },
  { value: "application_submitted", label: "Application Submitted", tone: "info" as const },
  { value: "application_review", label: "Application Review", tone: "info" as const },
  { value: "quotation_contract", label: "Quotation & Contract", tone: "info" as const },
  { value: "audit_programme", label: "Audit Programme", tone: "info" as const },
  { value: "stage1_planning", label: "Stage 1 Planning", tone: "warning" as const },
  { value: "stage1_completed", label: "Stage 1 Completed", tone: "warning" as const },
  { value: "stage1_actions", label: "Stage 1 Actions", tone: "warning" as const },
  { value: "stage2_planning", label: "Stage 2 Planning", tone: "warning" as const },
  { value: "stage2_completed", label: "Stage 2 Completed", tone: "info" as const },
  { value: "ncr_response", label: "NCR Response", tone: "warning" as const },
  { value: "ncr_verification", label: "NCR Verification", tone: "warning" as const },
  { value: "technical_review", label: "Technical Review", tone: "info" as const },
  { value: "certification_decision", label: "Certification Decision", tone: "warning" as const },
  { value: "certificate_preparation", label: "Certificate Preparation", tone: "info" as const },
  { value: "certificate_issued", label: "Certificate Issued", tone: "success" as const },
  { value: "surveillance", label: "Surveillance", tone: "info" as const },
  { value: "recertification", label: "Recertification", tone: "info" as const },
  { value: "suspended", label: "Suspended", tone: "danger" as const },
  { value: "withdrawn", label: "Withdrawn", tone: "danger" as const },
  { value: "closed", label: "Closed", tone: "muted" as const, isClosed: true },
];

export const projects: CollectionDef = {
  key: "projects",
  label: "Certification Projects",
  singular: "Project",
  numberPrefix: "PROJ",
  statuses: projectStages,
  workflow: projectStages,
  searchableText: (r) =>
    String(r.data.title ?? "") +
    " " +
    String(r.data.clientName ?? "") +
    " " +
    String(r.data.standard ?? "") +
    " " +
    r.number,
  fields: [
    { key: "title", label: "Project Title", type: "text", required: true, listCol: true },
    { key: "clientName", label: "Client", type: "text", listCol: true, filterable: true },
    {
      key: "clientId",
      label: "Client",
      type: "ref",
      refCollection: "clients",
      refLabelKey: "organizationName",
      refNumberKey: "number",
    },
    { key: "applicationNumber", label: "Application No.", type: "text", listCol: true },
    {
      key: "standard",
      label: "Standard",
      type: "select",
      listCol: true,
      filterable: true,
      options: STANDARDS.map((s) => ({ value: s, label: s })),
    },
    {
      key: "framework",
      label: "Framework",
      type: "select",
      listCol: true,
      filterable: true,
      options: FRAMEWORKS,
    },
    { key: "scope", label: "Scope", type: "textarea", listCol: true },
    { key: "scheme", label: "Scheme", type: "text" },
    { key: "owner", label: "Project Owner", type: "text", listCol: true },
    { key: "dueDate", label: "Target Date", type: "date", listCol: true },
    { key: "progress", label: "Progress %", type: "number" },
  ],
};

import { EXTENDED_COLLECTIONS } from "./records-collections-ext";

export const COLLECTIONS: Record<string, CollectionDef> = {
  applications,
  clients,
  leads,
  contacts,
  sites,
  opportunities,
  quotations,
  contracts,
  communications,
  feedback,
  projects,
  ...EXTENDED_COLLECTIONS,
};

export function getCollectionDef(key: string): CollectionDef {
  const def = COLLECTIONS[key];
  if (!def) throw new Error(`Unknown collection: ${key}`);
  return def;
}
