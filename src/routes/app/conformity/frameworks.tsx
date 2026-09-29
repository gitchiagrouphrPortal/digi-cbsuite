import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listFrameworksFn, calculateComplianceFn } from "@/lib/conformity.functions";
import type { FrameworkDTO, ComplianceResult } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { ComplianceRing, StatCard } from "@/components/conformity-ui";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/conformity/frameworks")({
  head: () => ({
    meta: [
      { title: "Framework Register — DigiCB" },
      { name: "description", content: "Accreditation framework workspaces with live readiness." },
    ],
  }),
  component: Page,
});

import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";

function Page() {
  const get = useServerFn(listFrameworksFn);
  const [items, setItems] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
  const [scores, setScores] = useState<Record<string, ComplianceResult>>({
    fw_17021: INITIAL_COMPLIANCE.fw_17021,
    fw_ps4992: INITIAL_COMPLIANCE.fw_ps4992,
    fw_17024: INITIAL_COMPLIANCE.fw_17024,
    fw_17065: INITIAL_COMPLIANCE.fw_17065,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const fws = await get();
        if (a && fws && fws.length > 0) setItems(fws);
      } catch {
        // use fallback initial data
      }
    })();
    return () => {
      a = false;
    };
  }, [get]);

  return (
    <div>
      <AppPageHeader
        title="Framework Register"
        description="Configurable accreditation frameworks. Each workspace maintains its own standards, clauses, assessments and compliance."
      >
        <Link
          to="/app/conformity/"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Dashboard
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
                <div className="mt-4 flex gap-2">
                  <Link
                    to="/app/conformity/standards"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Standards →
                  </Link>
                  <Link
                    to="/app/conformity/clauses"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clauses →
                  </Link>
                  <Link
                    to="/app/conformity/status"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Status →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
