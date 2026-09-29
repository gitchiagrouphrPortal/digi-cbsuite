// DigiCB Conformity Engine — shared types (client-safe).
export interface FrameworkDTO {
  id: string;
  code: string;
  label: string;
  description: string;
}

export interface StandardDTO {
  id: string;
  frameworkId: string;
  number: string;
  title: string;
  issuingOrg: string;
  edition: string;
  revision: string;
  publicationDate: string;
  effectiveDate: string;
  transitionDeadline: string;
  status: string; // current, transition, superseded, draft, withdrawn
  supersedes: string | null;
  supersededBy: string | null;
  applicableSchemes: string[];
  owner: string;
}

export interface ClauseDTO {
  id: string;
  standardId: string;
  frameworkId: string;
  number: string;
  parentId: string | null;
  title: string;
  requirementSummary: string;
  requirementType: string;
  mandatory: boolean;
  applicability: string;
  responsibleProcess: string;
  responsibleOwner: string;
  applicableModules: string[];
  requiredEvidenceTypes: string[];
  assessmentFrequency: string;
  weight: number;
  assessmentStatus: string;
  complianceScore: number;
  lastAssessed: string | null;
  nextAssessment: string | null;
  assessor: string | null;
}

export interface ModuleMappingDTO {
  id: string;
  clauseId: string;
  clauseRef: string;
  module: string;
  submodule: string;
}

export interface EvidenceDTO {
  id: string;
  title: string;
  evidenceType: string;
  sourceModule: string;
  sourceRecord: string | null;
  frameworkId: string;
  clauseIds: string[];
  owner: string;
  reviewer: string;
  approvalStatus: string;
  version: string;
  effectiveDate: string | null;
  expiryDate: string | null;
  validity: "valid" | "expired" | "missing";
  confidentiality: string;
  comments: string;
}

export interface AssessmentDTO {
  id: string;
  clauseId: string;
  status: string;
  score: number;
  notes: string;
  evidenceIds: string[];
  assessor: string;
  reviewer: string | null;
  approver: string | null;
  approvalStatus: string;
  notApplicableJustification: string | null;
  assessedAt: string;
  approvedAt: string | null;
}

export interface ClauseResult {
  clauseId: string;
  number: string;
  title: string;
  status: string;
  score: number;
  assessed: boolean;
  hasValidEvidence: boolean;
}

export interface ComplianceResult {
  overallReadiness: number;
  evidenceCoverage: number;
  assessmentCoverage: number;
  assessedConformity: number;
  totalApplicable: number;
  conforming: number;
  partial: number;
  nonconforming: number;
  unassessed: number;
  approvedExclusions: number;
  missingEvidence: number;
  expiredEvidence: number;
  results: ClauseResult[];
}

export interface ReassessmentReminder {
  id: string;
  kind: "evidence_expiry" | "standard_transition" | "clause_reassessment";
  title: string;
  detail: string;
  dueDate: string | null;
  daysLeft: number | null; // negative = overdue
  severity: "critical" | "warning" | "info";
  owner: string;
  link: string;
  relatedClauses: string[];
  frameworkId: string;
}
