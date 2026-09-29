// DigiCB Risk Management — shared seed builder (server-only).
import type { StoredRecord } from "./records-schema";
import { inherentScore, scoreToLevel, residualScore } from "./records-risks-scoring";

export interface RiskSeed {
  number: string;
  title: string;
  framework: string;
  category: string;
  standard: string;
  clause: string;
  module: string;
  submodule: string;
  cause: string;
  impact: string;
  controls: string;
  likelihood: number;
  impactScore: number;
  controlEffectiveness: string;
  status: string;
  owner: string;
  actionOwner: string;
  treatment: string;
  treatmentAction: string;
  residualAction?: string;
  targetDate: string;
  reviewDate: string;
  kpi: string;
  internalAudit: string;
  finding: string;
  correctiveAction: string;
  approver: string;
}

export function riskRec(s: RiskSeed, daysAgo: number): StoredRecord {
  const inherent = inherentScore(s.likelihood, s.impactScore);
  const level = scoreToLevel(inherent);
  const residual = residualScore(inherent, s.controlEffectiveness);
  const ts = Date.now() - daysAgo * 86400000;
  return {
    id: `seed_risks_${s.number}`,
    number: s.number,
    collection: "risks",
    status: s.status,
    owner: s.owner,
    ownerId: null,
    branchId: "br_ho",
    framework: s.framework,
    data: {
      title: s.title,
      framework: s.framework,
      category: s.category,
      standard: s.standard,
      clause: s.clause,
      module: s.module,
      submodule: s.submodule,
      cause: s.cause,
      potentialImpact: s.impact,
      existingControls: s.controls,
      likelihood: String(s.likelihood),
      impact: String(s.impactScore),
      inherentScore: inherent,
      riskLevel: level,
      controlEffectiveness: s.controlEffectiveness,
      residualScore: residual,
      treatment: s.treatment,
      treatmentAction: s.treatmentAction,
      residualAction:
        s.residualAction ??
        (residual > 0
          ? `Residual risk ${residual} (${scoreToLevel(residual)}): ${s.treatmentAction}`
          : "Residual risk reduced to acceptable level — monitor and review."),
      evidence: "DEMO/INITIAL REFERENCE DATA — MUST BE VALIDATED",
      owner: s.owner,
      actionOwner: s.actionOwner,
      targetDate: s.targetDate,
      reviewDate: s.reviewDate,
      kpi: s.kpi,
      internalAudit: s.internalAudit,
      finding: s.finding,
      correctiveAction: s.correctiveAction,
      approver: s.approver,
    },
    archived: false,
    demo: true,
    createdBy: "system",
    createdById: "system",
    createdAt: ts,
    updatedBy: "system",
    updatedAt: ts,
    comments: [],
    attachments: [],
    history: [{ id: `h_${s.number}`, actor: "system", action: "Demo risk seeded", ts }],
  };
}
