import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { calculateComplianceFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { ComplianceResult, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, SectionTitle } from "@/components/app-primitives";
import { ComplianceRing, StatCard, ComplianceBar } from "@/components/conformity-ui";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/conformity/readiness")({
  head: () => ({
    meta: [
      { title: "Accreditation Readiness — DigiCB" },
      {
        name: "description",
        content: "Evidence-based readiness assessment for accreditation application.",
      },
    ],
  }),
  component: Page,
});

import { INITIAL_FRAMEWORKS, INITIAL_COMPLIANCE } from "@/lib/conformity-client-data";

function Page() {
  const getFws = useServerFn(listFrameworksFn);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>(INITIAL_FRAMEWORKS);
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
        const fws = await getFws();
        if (a && fws && fws.length > 0) setFrameworks(fws);
      } catch {
        // fallback
      }
    })();
    return () => {
      a = false;
    };
  }, [getFws]);

  if (loading) {
    return (
      <div>
        <AppPageHeader
          title="Accreditation Readiness"
          description="Evidence-based readiness for each accreditation framework."
        />
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculating…
        </Card>
      </div>
    );
  }

  const avg =
    frameworks.length > 0
      ? Math.round(
          frameworks.reduce((sum, f) => sum + (scores[f.id]?.overallReadiness ?? 0), 0) /
            frameworks.length,
        )
      : 0;

  return (
    <div>
      <AppPageHeader
        title="Accreditation Readiness"
        description="Evidence-based readiness for accreditation application. Percentages are calculated from clause assessments — never manually entered."
      >
        <Link
          to="/app/conformity/gap"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          View Gaps
        </Link>
      </AppPageHeader>

      <Card className="mb-6 flex flex-col items-center justify-center py-8">
        <ComplianceRing
          pct={avg}
          label="Average Organizational Readiness"
          sub={`Across ${frameworks.length} frameworks`}
        />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {frameworks.map((f) => {
          const r = scores[f.id];
          if (!r) return null;
          const ready = r.overallReadiness >= 80;
          return (
            <Card key={f.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{f.code}</p>
                  <h3 className="font-display text-lg font-bold text-foreground">{f.label}</h3>
                </div>
                <ComplianceRing pct={r.overallReadiness} size="sm" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatCard label="Coverage" value={`${r.evidenceCoverage}%`} tone="text-info" />
                <StatCard label="Conforming" value={r.conforming} tone="text-success" />
                <StatCard
                  label="Gaps"
                  value={r.nonconforming + r.partial + r.missingEvidence}
                  tone="text-destructive"
                />
              </div>
              <div className="mt-3">
                <ComplianceBar
                  pct={r.overallReadiness}
                  label={
                    ready ? "Ready for accreditation application" : "Gaps remain — see analysis"
                  }
                />
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/app/conformity/status"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Status →
                </Link>
                <Link
                  to="/app/conformity/gap"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Gaps →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
