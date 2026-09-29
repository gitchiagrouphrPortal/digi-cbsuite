import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import { CERT_STAGES, NCR_STAGES, DOC_WORKFLOW, REG_LIBRARY } from "@/lib/digicb-data";
import { StatusBadge } from "@/components/status-badges";
import { FileSignature, MessageSquareWarning, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows & Central Approval — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB certification Kanban, NCR workflow, document-control lifecycle and central approval hub with feedback loops.",
      },
      { property: "og:title", content: "Workflows & Central Approval — DigiCB" },
      {
        property: "og:description",
        content: "Certification Kanban, NCR workflow, document lifecycle and central approval hub.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkflowsRoute,
});

const APPROVAL_STAGES = [
  "Submitted",
  "Under review",
  "Feedback requested",
  "Changes requested",
  "Re-review",
  "Approved",
  "Rejected",
];

function KanbanBoard({ stages, accent = "primary" }: { stages: string[]; accent?: string }) {
  return (
    <div className="kanban-scroll flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage, i) => (
        <div
          key={stage}
          className="flex w-44 shrink-0 flex-col rounded-lg border border-border bg-muted/40"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-semibold text-foreground">{stage}</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
              {i + 1}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-2">
            {i % 3 === 0 && (
              <div className="rounded-md border border-border bg-card p-2 text-[11px] text-foreground shadow-sm">
                <p className="font-medium">Sample card</p>
                <p className="mt-1 text-muted-foreground">Owner · Due date</p>
              </div>
            )}
            {i === 0 && (
              <div className="rounded-md border border-border bg-card p-2 text-[11px] text-foreground shadow-sm">
                <p className="font-medium">Another card</p>
                <p className="mt-1 text-muted-foreground">SLA tracking</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkflowsRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 06"
        title="Workflows & Central Approval"
        description="Kanban-based certification and NCR workflows, the document-control lifecycle, and a central approval hub with review feedback and request-changes loops."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard
          title="Certification project Kanban"
          description="20-stage default for ISO/IEC 17021-1. Templates are configurable per framework (17024, 17065, PS 4992). Each move supports entry/exit criteria, mandatory documents, approvals, owner, due date, SLA, checklists, e-signatures, and skip/reopen reasons."
        >
          <KanbanBoard stages={CERT_STAGES} />
        </SectionCard>

        <SectionCard
          title="NCR & corrective-action Kanban"
          description="13-stage configurable flow with major/minor/observation classification, evidence, root cause, verification and effectiveness review. Terminology (NC/NCR) is configurable."
        >
          <KanbanBoard stages={NCR_STAGES} accent="warning" />
        </SectionCard>

        <SectionCard
          title="Document-control workflow"
          description="Versioning is immutable; revisions create new controlled versions, never overwrite. Superseded versions are watermarked and downloadable by authorized users."
        >
          <div className="flex flex-wrap items-center gap-2">
            {DOC_WORKFLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  {s}
                </span>
                {i < DOC_WORKFLOW.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Side-by-side comparison</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Inserted, modified, deleted and moved content highlighted across versions.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Superseded watermarks</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Obsolete versions visibly marked; general users cannot accidentally use them.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="font-semibold text-foreground">Restore via new version</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Restoration creates a new controlled version; history is never deleted.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Central approval hub"
          description="A single review queue for every document requiring approval — review, comment, request changes, or approve with e-signature. SoD prevents self-approval."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <FileSignature className="h-4 w-4 text-primary" /> Approval pipeline
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {APPROVAL_STAGES.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md border border-info/30 bg-info/10 px-3 py-1.5 text-xs font-semibold text-info">
                      {s}
                    </span>
                    {i < APPROVAL_STAGES.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  {
                    doc: "QMS-AUD-PRO-014 · Stage 2 Audit Procedure",
                    stage: "Under review",
                    status: "review",
                  },
                  {
                    doc: "HAL-FRM-001 · Halal Application Form",
                    stage: "Changes requested",
                    status: "rejected",
                  },
                  {
                    doc: "PER-CL-007 · Competence Matrix Policy",
                    stage: "Approved",
                    status: "approved",
                  },
                ].map((row) => (
                  <div
                    key={row.doc}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.doc}</p>
                      <p className="text-xs text-muted-foreground">{row.stage}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <MessageSquareWarning className="h-4 w-4 text-warning" /> Reviewer feedback loop
              </h3>
              <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
                <p className="text-sm text-foreground">
                  Reviewers can leave inline comments and request changes; the document returns to
                  the author with tracked feedback, then re-enters the pipeline. Every cycle is
                  versioned and audit-logged.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="rounded-md border border-border bg-card p-2.5 text-xs">
                    <p className="font-semibold text-foreground">Reviewer · 09:12</p>
                    <p className="mt-1 text-muted-foreground">
                      “Clause 6.1 wording needs to reflect Global ACI MD 1 (2026).”
                    </p>
                  </div>
                  <div className="rounded-md border border-border bg-card p-2.5 text-xs">
                    <p className="font-semibold text-foreground">Author · 10:05</p>
                    <p className="mt-1 text-muted-foreground">“Updated — request re-review.”</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Regulatory document library preview"
          description="Legacy IAF and current Global ACI documents maintained with effective dates and supersession relationships."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold text-foreground">Document</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Title</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Effective</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Status</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Supersession</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {REG_LIBRARY.slice(0, 8).map((d) => (
                  <tr key={d.id} className="bg-card">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                      {d.code}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.effective}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.supersededBy
                        ? `→ ${d.supersededBy}`
                        : d.supersedes
                          ? `← ${d.supersedes}`
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
