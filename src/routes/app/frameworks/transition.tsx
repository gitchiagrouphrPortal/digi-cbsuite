import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { listStandardsFn } from "@/lib/conformity.functions";
import type { StandardDTO } from "@/lib/conformity-schema";
import { AppPageHeader, Card, EmptyState, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/frameworks/transition")({
  head: () => ({ meta: [{ title: "Transition Plans — DigiCB" }] }),
  component: Page,
});

function Page() {
  const get = useServerFn(listStandardsFn);
  const [items, setItems] = useState<StandardDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await get();
        if (a) setItems((r || []).filter((s) => s.status === "transition" || s.transitionDeadline));
      } catch {
        /* */
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, [get]);

  return (
    <div>
      <AppPageHeader
        title="Transition Plans"
        description="Standards and mandatory documents in transition. Clause structures are compared, old clauses mapped to replacements, and compliance recalculated only after reassessment."
      >
        <Link
          to="/app/conformity/transition"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          Transition Management
        </Link>
      </AppPageHeader>
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading transitions…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No active transitions"
          body="Standards in transition will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{s.number}</p>
                  <h3 className="font-display text-base font-bold text-foreground">{s.title}</h3>
                </div>
                <Pill tone="warning">{s.status}</Pill>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Edition: {s.edition} · Revision: {s.revision}
                </p>
                <p className="text-muted-foreground">Effective: {s.effectiveDate}</p>
                <p className="text-destructive">
                  Transition deadline: {s.transitionDeadline || "—"}
                </p>
                {s.supersedes && <p className="text-info">Supersedes: {s.supersedes}</p>}
              </div>
              <Link
                to="/app/conformity/transition"
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                Manage transition →
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
