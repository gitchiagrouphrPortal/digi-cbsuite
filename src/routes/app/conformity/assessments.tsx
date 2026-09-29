import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import {
  listClausesFn,
  listAssessmentsFn,
  listEvidenceFn,
  listFrameworksFn,
  saveAssessmentFn,
} from "@/lib/conformity.functions";
import type { ClauseDTO, AssessmentDTO, EvidenceDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill, ComplianceBadge } from "@/components/conformity-ui";
import { Search, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";

export const Route = createFileRoute("/app/conformity/assessments")({
  head: () => ({
    meta: [
      { title: "Clause Assessments — DigiCB" },
      {
        name: "description",
        content: "Assess clause conformity with evidence and authorized approval.",
      },
    ],
  }),
  component: Page,
});

const STATUS_OPTIONS = [
  { value: "not_assessed", label: "Not Assessed", score: 0 },
  { value: "in_progress", label: "Assessment in Progress", score: 0 },
  { value: "conforming", label: "Conforming", score: 100 },
  { value: "partial", label: "Partially Conforming", score: 50 },
  { value: "nonconforming", label: "Nonconforming", score: 0 },
  { value: "evidence_missing", label: "Evidence Missing", score: 0 },
  { value: "evidence_expired", label: "Evidence Expired", score: 0 },
  { value: "not_applicable", label: "Not Applicable (requires approval)", score: 0 },
  { value: "pending_review", label: "Pending Review", score: 0 },
  { value: "corrective_action_open", label: "Corrective Action Open", score: 50 },
  { value: "verification_pending", label: "Verification Pending", score: 50 },
  { value: "closed", label: "Closed", score: 100 },
];

function Page() {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canAssess = roleHas("conformity", perms);

  const getClauses = useServerFn(listClausesFn);
  const getAssessments = useServerFn(listAssessmentsFn);
  const getEvidence = useServerFn(listEvidenceFn);
  const getFws = useServerFn(listFrameworksFn);
  const saveAssessment = useServerFn(saveAssessmentFn);

  const [clauses, setClauses] = useState<ClauseDTO[]>([]);
  const [assessments, setAssessments] = useState<AssessmentDTO[]>([]);
  const [evidence, setEvidence] = useState<EvidenceDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [fwFilter, setFwFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [c, as, e, f] = await Promise.all([
          getClauses(),
          getAssessments(),
          getEvidence(),
          getFws(),
        ]);
        if (!a) return;
        setClauses(c);
        setAssessments(as);
        setEvidence(e);
        setFrameworks(f);
      } catch {
        /* keep empty state */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getClauses, getAssessments, getEvidence, getFws]);

  const rows = useMemo(() => {
    return clauses
      .filter((c) => fwFilter === "all" || c.frameworkId === fwFilter)
      .filter((c) => statusFilter === "all" || c.assessmentStatus === statusFilter)
      .filter(
        (c) =>
          !query.trim() ||
          c.number.toLowerCase().includes(query.toLowerCase()) ||
          c.title.toLowerCase().includes(query.toLowerCase()),
      )
      .map((c) => {
        const a = assessments.find((x) => x.clauseId === c.id);
        const ev = evidence.filter((e) => e.clauseIds.includes(c.id));
        return { clause: c, assessment: a, evidence: ev };
      });
  }, [clauses, assessments, evidence, fwFilter, statusFilter, query]);

  const editingClause = clauses.find((c) => c.id === editing);
  const editingAssessment = assessments.find((a) => a.clauseId === editing);

  return (
    <div>
      <AppPageHeader
        title="Clause Assessments"
        description="Assess clause conformity against evidence. Status drives live compliance. Not Applicable requires written justification and approval."
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clause…"
              className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={fwFilter}
            onChange={(e) => setFwFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Frameworks</option>
            {frameworks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Loading assessments…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="No clauses" body="Adjust filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Clause</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Evidence</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Assessor</th>
                  <th className="px-3 py-2">Last</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ clause, assessment, evidence: ev }) => (
                  <tr key={clause.id} className="border-b border-border/60 hover:bg-muted/30">
                    <td className="px-3 py-2.5">
                      <Link
                        to="/app/conformity/clauses"
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {clause.number}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground">{clause.title}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {ev.length === 0 ? (
                        <span className="text-warning">none</span>
                      ) : (
                        `${ev.length}`
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={clause.assessmentStatus} compact />
                    </td>
                    <td className="px-3 py-2.5">
                      <ComplianceBadge pct={clause.complianceScore} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {assessment?.assessor ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">
                      {clause.lastAssessed ?? "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {canAssess && (
                        <button
                          onClick={() => setEditing(clause.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Assess
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && editingClause && (
        <AssessmentModal
          clause={editingClause}
          assessment={editingAssessment}
          evidence={evidence.filter((e) => e.clauseIds.includes(editingClause.id))}
          onClose={() => setEditing(null)}
          onSave={async (status, notes, evidenceIds) => {
            try {
              await saveAssessment({
                data: { clauseId: editingClause.id, status, notes, evidenceIds },
              });
              toast.success("Assessment saved — compliance recalculated");
              // refresh
              const [c, as] = await Promise.all([getClauses(), getAssessments()]);
              setClauses(c);
              setAssessments(as);
              setEditing(null);
            } catch {
              toast.error("Failed to save assessment");
            }
          }}
        />
      )}
    </div>
  );
}

function AssessmentModal({
  clause,
  assessment,
  evidence,
  onClose,
  onSave,
}: {
  clause: ClauseDTO;
  assessment?: AssessmentDTO;
  evidence: EvidenceDTO[];
  onClose: () => void;
  onSave: (status: string, notes: string, evidenceIds: string[]) => Promise<void>;
}) {
  const [status, setStatus] = useState(assessment?.status ?? clause.assessmentStatus);
  const [notes, setNotes] = useState(assessment?.notes ?? "");
  const [evidenceIds, setEvidenceIds] = useState<string[]>(assessment?.evidenceIds ?? []);
  const [justification, setJustification] = useState(assessment?.notApplicableJustification ?? "");
  const [busy, setBusy] = useState(false);

  const isNA = status === "not_applicable";

  const toggleEv = (id: string) =>
    setEvidenceIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{clause.number}</p>
            <h3 className="font-display text-lg font-bold text-foreground">{clause.title}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assessment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.score}%)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Linked Evidence
            </label>
            <div className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {evidence.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No evidence registered for this clause.
                </p>
              ) : (
                evidence.map((e) => (
                  <label key={e.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={evidenceIds.includes(e.id)}
                      onChange={() => toggleEv(e.id)}
                    />
                    <span className="text-foreground">{e.title}</span>
                    <span className="text-xs text-muted-foreground">({e.validity})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {isNA && (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-3">
              <p className="text-xs font-semibold text-warning">
                Not Applicable requires written justification and approval.
              </p>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Justification for exclusion…"
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={2}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assessment Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Findings, observations…"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              rows={3}
            />
          </div>

          <p className="rounded-md bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
            Saving an assessment recalculates live compliance. Closing an NCR does not auto-set a
            clause to Conforming — a separate authorized reassessment is required.
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-input px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            disabled={busy || (isNA && !justification.trim())}
            onClick={async () => {
              setBusy(true);
              await onSave(status, isNA ? `NA: ${justification}` : notes, evidenceIds);
              setBusy(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
