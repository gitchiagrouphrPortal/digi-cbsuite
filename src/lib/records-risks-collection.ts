// DigiCB Risk Management — risk collection definition (client-safe).
// Shaped as a CollectionDef so it works with the generic record engine,
// RecordListView and the risk register / Kanban / filtered views.
import type { CollectionDef } from "./records-schema";

const FRAMEWORK_OPTS = [
  { value: "17021", label: "ISO/IEC 17021-1" },
  { value: "ps4992", label: "PS 4992 (Halal)" },
  { value: "17024", label: "ISO/IEC 17024" },
  { value: "17065", label: "ISO/IEC 17065" },
];

const CATEGORY_OPTS = [
  { value: "impartiality", label: "Impartiality" },
  { value: "competence", label: "Competence" },
  { value: "certification_process", label: "Certification Process" },
  { value: "information_security", label: "Information Security" },
  { value: "outsourcing", label: "Outsourcing" },
  { value: "branch_control", label: "Branch Control" },
  { value: "compliance", label: "Compliance" },
  { value: "halal_specific", label: "Halal Specific" },
  { value: "product_specific", label: "Product Specific" },
  { value: "operational", label: "Operational" },
];

const LEVEL_OPTS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "extreme", label: "Extreme" },
];

const SCALE_OPTS = [
  { value: "1", label: "1 — Rare" },
  { value: "2", label: "2 — Unlikely" },
  { value: "3", label: "3 — Possible" },
  { value: "4", label: "4 — Likely" },
  { value: "5", label: "5 — Almost Certain" },
];

const IMPACT_OPTS = [
  { value: "1", label: "1 — Negligible" },
  { value: "2", label: "2 — Minor" },
  { value: "3", label: "3 — Moderate" },
  { value: "4", label: "4 — Major" },
  { value: "5", label: "5 — Severe" },
];

const CONTROL_OPTS = [
  { value: "weak", label: "Weak" },
  { value: "adequate", label: "Adequate" },
  { value: "strong", label: "Strong" },
];

const TREATMENT_OPTS = [
  { value: "mitigate", label: "Mitigate" },
  { value: "avoid", label: "Avoid" },
  { value: "transfer", label: "Transfer" },
  { value: "accept", label: "Accept" },
];

const riskStatuses = [
  { value: "identified", label: "Identified", tone: "muted" as const },
  { value: "assessed", label: "Assessed", tone: "info" as const },
  { value: "treating", label: "Treating", tone: "warning" as const },
  { value: "monitoring", label: "Monitoring", tone: "info" as const },
  { value: "closed", label: "Closed", tone: "success" as const, isClosed: true },
];

export const risks: CollectionDef = {
  key: "risks",
  label: "Risk Register",
  singular: "Risk",
  numberPrefix: "RSK",
  statuses: riskStatuses,
  workflow: riskStatuses,
  searchableText: (r) =>
    String(r.data.title ?? "") +
    " " +
    String(r.data.category ?? "") +
    " " +
    String(r.data.clause ?? "") +
    " " +
    String(r.data.owner ?? "") +
    " " +
    String(r.data.standard ?? "") +
    " " +
    r.number,
  fields: [
    { key: "title", label: "Risk Title", type: "text", required: true, listCol: true },
    {
      key: "framework",
      label: "Framework",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: FRAMEWORK_OPTS,
    },
    {
      key: "category",
      label: "Risk Category",
      type: "select",
      required: true,
      listCol: true,
      filterable: true,
      options: CATEGORY_OPTS,
    },
    { key: "standard", label: "Standard", type: "text" },
    { key: "clause", label: "Clause", type: "text", listCol: true },
    { key: "module", label: "Responsible Module", type: "text" },
    { key: "submodule", label: "Responsible Submodule", type: "text" },
    { key: "cause", label: "Cause", type: "textarea" },
    { key: "potentialImpact", label: "Potential Impact", type: "textarea" },
    { key: "existingControls", label: "Existing Controls", type: "textarea" },
    {
      key: "likelihood",
      label: "Likelihood (1-5)",
      type: "select",
      required: true,
      filterable: true,
      options: SCALE_OPTS,
    },
    {
      key: "impact",
      label: "Impact (1-5)",
      type: "select",
      required: true,
      options: IMPACT_OPTS,
    },
    { key: "inherentScore", label: "Assessment Score", type: "text", listCol: true },
    {
      key: "riskLevel",
      label: "Risk Level",
      type: "select",
      listCol: true,
      filterable: true,
      options: LEVEL_OPTS,
    },
    {
      key: "controlEffectiveness",
      label: "Control for Residual",
      type: "select",
      listCol: true,
      filterable: true,
      options: CONTROL_OPTS,
    },
    { key: "residualScore", label: "Residual Risk", type: "text", listCol: true },
    {
      key: "treatment",
      label: "Risk Treatment",
      type: "select",
      listCol: true,
      filterable: true,
      options: TREATMENT_OPTS,
    },
    { key: "treatmentAction", label: "Treatment Action", type: "textarea" },
    {
      key: "residualAction",
      label: "Residual Risk Action",
      type: "textarea",
    },
    { key: "evidence", label: "Evidence", type: "textarea" },
    { key: "owner", label: "Risk Owner", type: "text", listCol: true, filterable: true },
    { key: "actionOwner", label: "Action Owner", type: "text" },
    { key: "targetDate", label: "Target Date", type: "date", listCol: true, filterable: true },
    { key: "reviewDate", label: "Review Date", type: "date" },
    { key: "kpi", label: "Linked KPI", type: "text" },
    { key: "internalAudit", label: "Linked Internal Audit", type: "text" },
    { key: "finding", label: "Linked Finding", type: "text" },
    { key: "correctiveAction", label: "Linked Corrective Action", type: "text" },
    { key: "approver", label: "Approver", type: "text" },
  ],
};

// Backwards-compatible alias for any module that imported RISKS_COLLECTION.
export const RISKS_COLLECTION = risks;
