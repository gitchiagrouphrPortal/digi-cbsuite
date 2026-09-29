import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getBranchesFn } from "@/lib/digicb.functions";
import type { Branch } from "@/lib/digicb-types";
import { AppPageHeader, Card, DataTable, Pill, SectionTitle } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/admin/branches")({
  head: () => ({ meta: [{ title: "Branch Settings — DigiCB" }] }),
  component: Page,
});

function Page() {
  const get = useServerFn(getBranchesFn);
  const [items, setItems] = useState<Branch[] | null>(null);

  useEffect(() => {
    get()
      .then(setItems)
      .catch(() => {});
  }, [get]);

  return (
    <div>
      <AppPageHeader
        title="Branch Settings"
        description="Manage branch offices, types, jurisdictions and oversight configuration per IAF MD 23 / Global ACI successor."
      />
      {!items ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : (
        <Card>
          <SectionTitle>Branch offices</SectionTitle>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} branches registered.</p>
          <div className="mt-4">
            <DataTable
              headers={["Name", "Type", "City", "Country", "Manager", "Status"]}
              rows={items.map((b) => [
                <span className="font-medium text-foreground">{b.name}</span>,
                <Pill tone={b.type === "head_office" ? "success" : "info"}>
                  {b.type.replace(/_/g, " ")}
                </Pill>,
                <span className="text-muted-foreground">{b.city}</span>,
                <span className="text-muted-foreground">{b.country}</span>,
                <span className="text-muted-foreground">{b.manager}</span>,
                <Pill tone={b.status === "active" ? "success" : "muted"}>{b.status}</Pill>,
              ])}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
