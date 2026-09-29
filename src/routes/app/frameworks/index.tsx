import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listFrameworksFn, calculateAllComplianceFn } from "@/lib/conformity.functions";
import type { FrameworkDTO, ComplianceResult } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { ComplianceRing, StatCard } from "@/components/conformity-ui";
import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/frameworks/")({
  head: () => ({
    meta: [
      { title: "Accreditation Frameworks — DigiCB" },
      {
        name: "description",
        content: "Four accreditation-framework workspaces with live readiness.",
      },
    ],
  }),
  component: Page,
});

const FW_LINKS: Record<string, string> = {
  fw_17021: "/app/frameworks/17021",
  fw_ps4992: "/app/frameworks/ps4992",
  fw_17024: "/app/frameworks/17024",
  fw_17065: "/app/frameworks/17065",
};

function Page() {
  const getFws = useServerFn(listFrameworksFn);
  const getAll = useServerFn(calculateAllComplianceFn);
  const [items, setItems] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [scores, setScores] = useState<Record<string, ComplianceResult>>({
    fw_17021: INITIAL_COMPLIANCE.fw_17021,
    fw_ps4992: INITIAL_COMPLIANCE.fw_ps4992,
    fw_17024: INITIAL_COMPLIANCE.fw_17024,
    fw_17065: INITIAL_COMPLIANCE.fw_17065,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const [fws, all] = await Promise.all([getFws(), getAll()]);
        if (!a) return;
        if (fws && fws.length > 0) setItems(fws);
        if (all?.perFramework) setScores(all.perFramework);
      } catch {
        /* use fallback */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [getFws, getAll]);

  return (
    <div>
      <AppPageHeader
        title="Accreditation Frameworks"
        description="Separate configurable workspaces for each accreditation standard, with schemes, scopes, documents, personnel and live compliance."
      >
        <Link
          to="/app/conformity/"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Conformity Engine
        </Link>
      </AppPageHeader>

      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading frameworks…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No frameworks" body="Frameworks are seeded on first access." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((f) => {
            const r = scores[f.id];
            return (
              <Card key={f.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
                    <h3 className="font-display text-lg font-bold text-foreground">{f.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{f.description}</p>
                  </div>
                  {r && <ComplianceRing pct={r.overallReadiness} size="sm" />}
                </div>
                {r && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    <StatCard label="Applicable" value={r.totalApplicable} tone="text-foreground" />
                    <StatCard label="Conforming" value={r.conforming} tone="text-success" />
                    <StatCard label="Partial" value={r.partial} tone="text-warning" />
                    <StatCard
                      label="Unassessed"
                      value={r.unassessed}
                      tone="text-muted-foreground"
                    />
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={FW_LINKS[f.id] ?? "/app/frameworks"}
                    className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Open Workspace →
                  </Link>
                  <Link
                    to="/app/conformity/clauses"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clauses
                  </Link>
                  <Link
                    to="/app/conformity/evidence"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Evidence
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/app/frameworks/library" className="block">
          <Card className="hover:border-primary/40">
            <SectionTitle>IAF / Global ACI Documents</SectionTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Legacy IAF and current Global ACI mandatory documents with supersession links.
            </p>
          </Card>
        </Link>
        <Link to="/app/frameworks/findings" className="block">
          <Card className="hover:border-primary/40">
            <SectionTitle>Accreditation Findings</SectionTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Findings from accreditation-body assessments and surveillance visits.
            </p>
          </Card>
        </Link>
        <Link to="/app/frameworks/transition" className="block">
          <Card className="hover:border-primary/40">
            <SectionTitle>Transition Plans</SectionTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Standard revision transitions with clause mapping and deadlines.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
