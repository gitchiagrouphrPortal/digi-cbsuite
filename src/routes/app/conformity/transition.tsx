import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listStandardsFn, listFrameworksFn } from "@/lib/conformity.functions";
import type { StandardDTO, FrameworkDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusPill } from "@/components/conformity-ui";
import { AlertTriangle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/app/conformity/transition")({
  head: () => ({
    meta: [
      { title: "Transition Management — DigiCB" },
      {
        name: "description",
        content: "Standard revisions, supersession relationships and transition deadlines.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const get = useServerFn(listStandardsFn);
  const getFws = useServerFn(listFrameworksFn);
  const [items, setItems] = useState<StandardDTO[]>([]);
  const [frameworks, setFrameworks] = useState<FrameworkDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      setLoading(true);
      try {
        const [s, f] = await Promise.all([get(), getFws()]);
        if (!a) return;
        setItems(s);
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
  }, [get, getFws]);

  const superseded = items.filter((s) => s.status === "superseded" || s.supersededBy);
  const transitioning = items.filter((s) => s.status === "transition" || s.transitionDeadline);
  const today = new Date();

  return (
    <div>
      <AppPageHeader
        title="Transition Management"
        description="When standards change: preserve previous versions, map old clauses to replacements, identify affected modules and documents, and recalculate compliance only after reassessment."
      >
        <Link
          to="/app/conformity/mandatory-docs"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Mandatory Documents
        </Link>
      </AppPageHeader>

      <Card className="mb-6">
        <SectionTitle>Supersession Relationships</SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Legacy IAF documents remain applicable until superseded by current Global ACI
          publications. Historical compliance results are preserved under the old revision.
        </p>
        {superseded.length === 0 ? (
          <EmptyState
            title="No superseded documents"
            body="Supersession relationships appear here when standards are revised."
          />
        ) : (
          <div className="mt-3 space-y-2">
            {superseded.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <span className="font-mono text-xs font-semibold text-muted-foreground line-through">
                  {s.number}
                </span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs font-semibold text-primary">
                  {s.supersededBy}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">{s.title}</span>
                <StatusPill status={s.status} compact />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Transition Deadlines</SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Compliance is recalculated only after reassessment against the new revision.
        </p>
        {transitioning.length === 0 ? (
          <EmptyState
            title="No active transitions"
            body="Transition deadlines appear here when standards have transition dates."
          />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Document</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Effective</th>
                  <th className="px-3 py-2">Transition Deadline</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Days Left</th>
                </tr>
              </thead>
              <tbody>
                {transitioning.map((s) => {
                  const days = s.transitionDeadline
                    ? Math.ceil(
                        (new Date(s.transitionDeadline).getTime() - today.getTime()) / 86400000,
                      )
                    : null;
                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold text-primary">
                        {s.number}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{s.title}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {s.effectiveDate || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {s.transitionDeadline || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusPill status={s.status} compact />
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        {days === null ? (
                          "—"
                        ) : days < 0 ? (
                          <span className="font-semibold text-destructive">overdue</span>
                        ) : days < 30 ? (
                          <span className="flex items-center gap-1 font-semibold text-warning">
                            <AlertTriangle className="h-3 w-3" />
                            {days}d
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{days}d</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
