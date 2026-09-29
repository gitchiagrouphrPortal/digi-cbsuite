// DigiCB Conformity — module-clause mappings for PS 4992, ISO/IEC 17024,
// ISO/IEC 17065 frameworks. 17021 mappings live in conformity-seed.server.ts.
// Server-only (imports seed clauses).
import type { ModuleMappingDTO } from "./conformity-schema";
import { SEED_CLAUSES } from "./conformity-seed.server";

interface Ref {
  ref: string;
  module: string;
  submodule: string;
}

const MAPPING_PS4992: Ref[] = [
  { ref: "5.1", module: "CRM & Clients", submodule: "Halal certification agreement" },
  { ref: "4.2", module: "Internal Management System", submodule: "Impartiality" },
  {
    ref: "6.1",
    module: "Personnel & Competence",
    submodule: "Competence of management and personnel",
  },
  { ref: "6.2", module: "Personnel & Competence", submodule: "Contract reviewers" },
  { ref: "6.3", module: "Personnel & Competence", submodule: "Certification-decision personnel" },
  { ref: "6.4", module: "Personnel & Competence", submodule: "Technical auditors" },
  { ref: "6.5", module: "Personnel & Competence", submodule: "Technical experts" },
  { ref: "6.6", module: "Personnel & Competence", submodule: "Islamic affairs experts" },
  { ref: "6.7", module: "Audit Management", submodule: "Audit-team selection" },
  { ref: "6.10", module: "Personnel & Competence", submodule: "Outsourcing" },
  { ref: "7.1", module: "Documents", submodule: "Publicly accessible information" },
  { ref: "7.2", module: "Certificates", submodule: "Halal certification documents" },
  { ref: "7.4", module: "Certificates", submodule: "Halal marks and licences" },
  { ref: "7.5", module: "Documents", submodule: "Confidentiality" },
  { ref: "8.1", module: "Applications", submodule: "Halal application" },
  { ref: "8.2", module: "Applications", submodule: "Application review" },
  { ref: "8.3", module: "Audit Management", submodule: "Initial Halal certification audit" },
  { ref: "8.5", module: "Audit Management", submodule: "Sampling" },
  { ref: "8.6", module: "Audit Management", submodule: "Inspections and tests" },
  { ref: "8.8", module: "Audit Management", submodule: "Audit report" },
  { ref: "8.9", module: "Technical Review & Decisions", submodule: "Halal decision" },
  { ref: "8.11", module: "Audit Management", submodule: "Surveillance" },
  { ref: "8.12", module: "Certification Projects", submodule: "Recertification" },
  { ref: "8.14", module: "Certificates", submodule: "Suspension and withdrawal" },
  { ref: "8.13", module: "Complaints & Appeals", submodule: "Appeals" },
  { ref: "8.15", module: "Complaints & Appeals", submodule: "Complaints" },
  { ref: "9.1", module: "Documents", submodule: "Management-system manual" },
  { ref: "9.2", module: "Documents", submodule: "Document control" },
  { ref: "9.3", module: "Documents", submodule: "Record control" },
  { ref: "9.4", module: "Internal Management System", submodule: "Management review" },
  { ref: "9.5", module: "Internal Management System", submodule: "Internal audits" },
  { ref: "9.6", module: "Internal Management System", submodule: "Corrective actions" },
];

const MAPPING_17024: Ref[] = [
  { ref: "4.1", module: "CRM & Clients", submodule: "Legal matters" },
  {
    ref: "4.2",
    module: "Technical Review & Decisions",
    submodule: "Responsibility for certification decisions",
  },
  { ref: "4.3", module: "Internal Management System", submodule: "Liability and financing" },
  { ref: "5.1", module: "Internal Management System", submodule: "Organizational structure" },
  {
    ref: "5.2",
    module: "Internal Management System",
    submodule: "Training and certification separation",
  },
  { ref: "6.1", module: "Personnel & Competence", submodule: "Personnel requirements" },
  { ref: "6.2", module: "Personnel & Competence", submodule: "Examiners" },
  { ref: "6.3", module: "Personnel & Competence", submodule: "Outsourcing" },
  { ref: "7.1", module: "Documents", submodule: "Applicant and candidate records" },
  { ref: "8.1", module: "Accreditation Frameworks", submodule: "Scheme development" },
  { ref: "8.2", module: "Applications", submodule: "Candidate application" },
  { ref: "8.3", module: "Applications", submodule: "Eligibility review" },
  { ref: "8.4", module: "Training Academy", submodule: "Examination blueprint" },
  { ref: "8.5", module: "Training Academy", submodule: "Examination" },
  { ref: "8.6", module: "Training Academy", submodule: "Scoring" },
  { ref: "8.7", module: "Technical Review & Decisions", submodule: "Certification decision" },
  { ref: "8.8", module: "Certificates", submodule: "Suspension, withdrawal and scope reduction" },
  { ref: "8.9", module: "Certification Projects", submodule: "Recertification" },
  { ref: "9.1", module: "Documents", submodule: "Document control" },
  { ref: "9.2", module: "Documents", submodule: "Record control" },
  { ref: "9.3", module: "Internal Management System", submodule: "Management review" },
  { ref: "9.4", module: "Internal Management System", submodule: "Internal audit" },
  { ref: "9.5", module: "Internal Management System", submodule: "Corrective action" },
];

const MAPPING_17065: Ref[] = [
  { ref: "4.1", module: "CRM & Clients", submodule: "Legal and contractual matters" },
  { ref: "4.2", module: "Internal Management System", submodule: "Impartiality" },
  { ref: "4.3", module: "Internal Management System", submodule: "Liability and financing" },
  { ref: "5.1", module: "Internal Management System", submodule: "Organizational structure" },
  { ref: "5.2", module: "Internal Management System", submodule: "Safeguarding impartiality" },
  { ref: "6.1", module: "Personnel & Competence", submodule: "Certification-body personnel" },
  { ref: "6.2", module: "Personnel & Competence", submodule: "Evaluation resources" },
  { ref: "6.4", module: "Personnel & Competence", submodule: "External resources and outsourcing" },
  { ref: "7.1", module: "Documents", submodule: "Public information" },
  { ref: "8.1", module: "Applications", submodule: "Product application" },
  { ref: "8.2", module: "Applications", submodule: "Application review" },
  { ref: "8.3", module: "Audit Management", submodule: "Evaluation plan" },
  { ref: "8.4", module: "Audit Management", submodule: "Sampling" },
  { ref: "8.5", module: "Audit Management", submodule: "Inspection" },
  { ref: "8.6", module: "Audit Management", submodule: "Testing" },
  { ref: "8.7", module: "Audit Management", submodule: "Evaluation" },
  { ref: "8.8", module: "Technical Review & Decisions", submodule: "Review" },
  { ref: "8.9", module: "Technical Review & Decisions", submodule: "Certification decision" },
  { ref: "8.10", module: "Audit Management", submodule: "Surveillance" },
  { ref: "7.2", module: "Certificates", submodule: "Certification documentation" },
  { ref: "8.11", module: "Certificates", submodule: "Changes affecting certification" },
  {
    ref: "8.12",
    module: "Certificates",
    submodule: "Termination, reduction, suspension and withdrawal",
  },
  { ref: "9.1", module: "Documents", submodule: "General documentation" },
  { ref: "9.2", module: "Documents", submodule: "Document control" },
  { ref: "9.3", module: "Documents", submodule: "Record control" },
  { ref: "9.4", module: "Internal Management System", submodule: "Management review" },
  { ref: "9.5", module: "Internal Management System", submodule: "Internal audit" },
];

function buildMappings(refs: Ref[], fwId: string, prefix: string): ModuleMappingDTO[] {
  return refs.map((m, i) => {
    const clause = SEED_CLAUSES.find((c) => c.frameworkId === fwId && c.number === m.ref);
    return {
      id: `map_${prefix}_${i}`,
      clauseId: clause?.id ?? `unknown_${prefix}_${m.ref}`,
      clauseRef: m.ref,
      module: m.module,
      submodule: m.submodule,
    };
  });
}

export const EXTRA_MAPPINGS: ModuleMappingDTO[] = [
  ...buildMappings(MAPPING_PS4992, "fw_ps4992", "ps4992"),
  ...buildMappings(MAPPING_17024, "fw_17024", "17024"),
  ...buildMappings(MAPPING_17065, "fw_17065", "17065"),
];
