import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/certificates/expiring")({
  head: () => ({ meta: [{ title: "Expiring Certificates — DigiCB" }] }),
  component: Page,
});
function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    list({ data: { collection: "certificates", archived: false } })
      .then((r) => setRecords(r.records))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);
  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  const now = Date.now();
  const in90 = 90 * 24 * 3600 * 1000;
  const expiring = records.filter((r) => {
    const ed = r.data.expiryDate as string | undefined;
    if (!ed || r.status !== "issued") return false;
    const t = new Date(ed).getTime();
    return t > now && t - now < in90;
  });
  return (
    <div>
      <AppPageHeader
        title="Expiring Certificates"
        description="Certificates expiring within the next 90 days."
      />
      {expiring.length === 0 ? (
        <EmptyState
          title="No expiring certificates"
          body="No certificates expire within 90 days."
        />
      ) : (
        <Card>
          <div className="space-y-2">
            {expiring.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border border-border bg-warning/5 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {r.number} — {String(r.data.clientName ?? "—")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {String(r.data.expiryDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
