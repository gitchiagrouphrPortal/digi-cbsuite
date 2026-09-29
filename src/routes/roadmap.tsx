import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import { PHASES } from "@/lib/digicb-data";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Delivery Roadmap — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB seven-phase delivery roadmap with dependencies, acceptance gates, security tests and rollback plans.",
      },
      { property: "og:title", content: "Delivery Roadmap — DigiCB" },
      {
        property: "og:description",
        content: "Seven controlled delivery phases with dependencies and acceptance gates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoadmapRoute,
});

function RoadmapRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 08"
        title="Delivery Roadmap"
        description="Seven controlled phases. Each phase defines scope, dependencies, database changes, APIs, screens, permission rules, automated/security tests, migration considerations and a deployment & rollback plan."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-4">
        {PHASES.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
              <div className="flex shrink-0 flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground shadow-sm">
                  {p.id}
                </div>
                <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phase
                </span>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-semibold text-foreground">{p.name}</h2>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      Deps: {p.deps}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{p.focus}</p>
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-success/30 bg-success/5 p-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-[10px] font-bold text-success">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-success">
                      Acceptance gate
                    </p>
                    <p className="mt-1 text-sm text-foreground">{p.gates}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <SectionCard
          title="Next step"
          description="Full production development begins only after the deliverables are reviewed and approved."
        >
          <p className="text-sm text-muted-foreground">
            Review the{" "}
            <Link to="/prd" className="font-semibold text-primary hover:underline">
              PRD
            </Link>
            ,{" "}
            <Link to="/architecture" className="font-semibold text-primary hover:underline">
              architecture
            </Link>
            ,{" "}
            <Link to="/roles" className="font-semibold text-primary hover:underline">
              role-permission matrix
            </Link>{" "}
            and{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              clarification register
            </Link>
            , then confirm the open accreditation-expert items.
          </p>
        </SectionCard>
      </div>
    </PageShell>
  );
}
