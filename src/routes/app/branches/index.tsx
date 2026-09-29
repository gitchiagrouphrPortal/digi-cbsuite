import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getBranchesFn } from "@/lib/digicb.functions";
import type { Branch } from "@/lib/digicb-types";
import { AppPageHeader, Card, EmptyState, DataTable, Pill } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/branches/")({
  head: () => ({ meta: [{ title: "Branch Register — DigiCB" }] }),
  component: Page,
});

function Page() {
  const get = useServerFn(getBranchesFn);
  const [items, setItems] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await get();
        if (a) setItems(r || []);
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
        title="Branch Register"
        description="Head office, national, international, remote and franchise branches with oversight controls per IAF MD 23 / Global ACI successor."
      />
      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading branches…
        </Card>
      ) : items.length === 0 ? (
        <EmptyState title="No branches" body="Branches are seeded on first access." />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="font-display text-xl font-bold text-foreground">{items.length}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Head Office
              </p>
              <p className="font-display text-xl font-bold text-foreground">
                {items.filter((b) => b.type === "head_office").length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Active
              </p>
              <p className="font-display text-xl font-bold text-success">
                {items.filter((b) => b.status === "active").length}
              </p>
            </Card>
            <Card className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Countries
              </p>
              <p className="font-display text-xl font-bold text-foreground">
                {new Set(items.map((b) => b.country)).size}
              </p>
            </Card>
          </div>
          <DataTable
            headers={["Branch", "Type", "Country", "City", "Manager", "Status", ""]}
            rows={items.map((b) => [
              <span className="font-medium text-foreground">{b.name}</span>,
              <Pill tone={b.type === "head_office" ? "success" : "info"}>
                {b.type.replace(/_/g, " ")}
              </Pill>,
              <span className="text-muted-foreground">{b.country}</span>,
              <span className="text-muted-foreground">{b.city}</span>,
              <span className="text-muted-foreground">{b.manager}</span>,
              <Pill tone={b.status === "active" ? "success" : "muted"}>{b.status}</Pill>,
              <Link
                to="/app/branches/oversight"
                className="text-xs font-medium text-primary hover:underline"
              >
                Oversight →
              </Link>,
            ])}
          />
        </>
      )}
    </div>
  );
}
