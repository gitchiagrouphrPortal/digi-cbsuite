// DigiCB — helpers linking operational records to the conformity engine.
// Maps a record's collection key to the DigiCB module name used in the
// module-clause mappings, and resolves a record's framework field to a
// conformity framework ID.

export function moduleForCollection(collectionKey: string): string | null {
  const map: Record<string, string> = {
    leads: "CRM & Clients",
    clients: "CRM & Clients",
    contacts: "CRM & Clients",
    sites: "CRM & Clients",
    opportunities: "CRM & Clients",
    quotations: "CRM & Clients",
    contracts: "CRM & Clients",
    comms: "CRM & Clients",
    feedback: "CRM & Clients",
    applications: "Applications",
    appReviews: "Applications",
    projects: "Certification Projects",
    auditProgrammes: "Audit Management",
    audits: "Audit Management",
    auditTeams: "Audit Management",
    findings: "Audit Management",
    ncrs: "NCR & Corrective Actions",
    correctiveActions: "NCR & Corrective Actions",
    reviews: "Technical Review & Decisions",
    decisions: "Technical Review & Decisions",
    certificates: "Certificates",
    documents: "Documents",
    personnel: "Personnel & Competence",
    competencies: "Personnel & Competence",
    authorizations: "Personnel & Competence",
    internalAudits: "Internal Management System",
    mgmtReviews: "Internal Management System",
    risks: "Internal Management System",
    impartialityRisks: "Internal Management System",
    complaints: "Complaints & Appeals",
    appeals: "Complaints & Appeals",
    branches: "Branch Offices",
    kpis: "Internal Management System",
    resourceGaps: "Resource Gap",
    courses: "Training Academy",
    learners: "Training Academy",
    enrolments: "Training Academy",
  };
  return map[collectionKey] ?? null;
}

// Resolve a framework string (from a record's framework field) to a
// conformity framework ID. Accepts codes, labels and partial matches.
export function frameworkIdFromRecord(value: string | null): string | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.includes("17021") || v.includes("management system") || v === "fw_17021") return "fw_17021";
  if (v.includes("4992") || v.includes("halal") || v.includes("smiic") || v === "fw_ps4992")
    return "fw_ps4992";
  if (v.includes("17024") || v.includes("personnel") || v === "fw_17024") return "fw_17024";
  if (v.includes("17065") || v.includes("product") || v === "fw_17065") return "fw_17065";
  return null;
}

// Reverse: framework ID → human label
export const FRAMEWORK_LABELS: Record<string, string> = {
  fw_17021: "ISO/IEC 17021-1",
  fw_ps4992: "PS 4992 (Halal)",
  fw_17024: "ISO/IEC 17024",
  fw_17065: "ISO/IEC 17065",
};
