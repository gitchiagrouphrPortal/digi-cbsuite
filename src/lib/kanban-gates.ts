// DigiCB Kanban stage-gating configuration.
// Defines entry/exit criteria and required documents (data fields +
// attachments) per workflow stage so the board can block invalid forward
// moves and surface missing-document alerts. Client-safe.

export interface FieldRequirement {
  field: string;
  label: string;
  min?: number; // for numeric fields (e.g. progress %)
}

export interface StageGate {
  requiredFields?: FieldRequirement[];
  requiredAttachments?: number;
  entryCriteria?: string[];
  exitCriteria?: string[];
}

export const KANBAN_GATES: Record<string, Record<string, StageGate>> = {
  projects: {
    application_submitted: {
      requiredFields: [{ field: "clientName", label: "Client name" }],
      exitCriteria: ["Client identified", "Application logged"],
    },
    application_review: {
      requiredFields: [{ field: "applicationNumber", label: "Application number" }],
      exitCriteria: ["Application review complete", "Scope confirmed"],
    },
    quotation_contract: {
      requiredFields: [{ field: "owner", label: "Project owner" }],
      exitCriteria: ["Quotation accepted", "Contract signed"],
    },
    audit_programme: {
      requiredFields: [{ field: "scope", label: "Certification scope" }],
      exitCriteria: ["Audit programme created", "Audit duration calculated"],
    },
    stage1_planning: {
      requiredFields: [{ field: "scope", label: "Scope" }],
      requiredAttachments: 1,
      exitCriteria: ["Stage 1 audit plan issued", "Opening meeting scheduled"],
    },
    stage2_planning: {
      requiredAttachments: 1,
      exitCriteria: ["Stage 1 findings closed", "Stage 2 audit plan issued"],
    },
    technical_review: {
      requiredFields: [{ field: "progress", label: "Progress ≥ 50%", min: 50 }],
      exitCriteria: ["Technical review checklist signed", "Reviewer authorized"],
    },
    certification_decision: {
      requiredFields: [{ field: "progress", label: "Progress ≥ 60%", min: 60 }],
      exitCriteria: ["Independent decision-maker assigned", "Decision recorded"],
    },
    certificate_preparation: {
      requiredFields: [{ field: "progress", label: "Progress ≥ 80%", min: 80 }],
      exitCriteria: ["Certificate drafted", "Scope verified"],
    },
    certificate_issued: {
      requiredFields: [{ field: "progress", label: "Progress ≥ 90%", min: 90 }],
      exitCriteria: ["Certificate issued", "QR verification active"],
    },
  },
};

export function getStageGate(coll: string, stage: string): StageGate | undefined {
  return KANBAN_GATES[coll]?.[stage];
}

export function fieldSatisfied(
  rec: { data: Record<string, unknown> },
  req: FieldRequirement,
): boolean {
  const v = rec.data[req.field];
  if (typeof v === "number") return req.min !== undefined ? v >= req.min : v > 0;
  if (typeof v === "boolean") return v === true;
  return v !== undefined && v !== null && String(v).trim() !== "";
}

export function missingGateItems(
  rec: { data: Record<string, unknown>; attachments: { id: string }[] },
  gate?: StageGate,
): string[] {
  if (!gate) return [];
  const missing: string[] = [];
  if (gate.requiredFields) {
    for (const req of gate.requiredFields) {
      if (!fieldSatisfied(rec, req)) missing.push(req.label);
    }
  }
  if (gate.requiredAttachments && rec.attachments.length < gate.requiredAttachments) {
    missing.push(`${gate.requiredAttachments} attachment(s)`);
  }
  return missing;
}
