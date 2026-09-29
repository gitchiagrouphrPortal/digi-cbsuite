import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import { StatusBadge } from "@/components/status-badges";
import { REGISTER } from "@/lib/digicb-data";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Clarification Register — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB assumptions and open questions requiring accreditation-expert confirmation before development.",
      },
      { property: "og:title", content: "Clarification Register — DigiCB" },
      {
        property: "og:description",
        content: "Assumptions and open questions requiring expert confirmation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterRoute,
});

const PRIORITY_LABEL: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

function RegisterRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 05"
        title="Clarification Register"
        description="Assumptions made during planning and the open questions requiring confirmation by an accreditation expert before production development."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <SectionCard
          title="Assumptions & open questions"
          description="Items not silently assumed — each is flagged with an owner and priority."
        >
          <div className="space-y-3">
            {REGISTER.map((r, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="font-medium text-foreground">{r.q}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={
                        r.priority === "high"
                          ? "blocked"
                          : r.priority === "medium"
                            ? "pending"
                            : "review"
                      }
                      label={PRIORITY_LABEL[r.priority]}
                    />
                  </div>
                </div>
                <div className="mt-3 ml-10 space-y-1.5">
                  <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Assumption: </span>
                    {r.a}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owner: <span className="font-medium text-foreground">{r.owner}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Items requiring accreditation-expert confirmation"
          description="These must not be silently assumed at build time."
        >
          <ul className="space-y-2 text-sm text-foreground">
            {[
              "PS 4992 Halal category alignment (OIC/SMIIC vs local).",
              "Multi-site sampling formula default (IAF MD 1 / Global ACI successor).",
              "Legacy IAF + Global ACI document retention and supersession rules.",
              "Per-tenant Accreditation Body assessor portal scoping.",
            ].map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {l}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageShell>
  );
}
