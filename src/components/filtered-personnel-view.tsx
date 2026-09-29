import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function FilteredPersonnelView({
  role,
  title,
  desc,
}: {
  role: string;
  title: string;
  desc: string;
}) {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    list({ data: { collection: "personnel", archived: false } })
      .then((r) => setRecords(r.records.filter((x) => x.data.role === role)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);
  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  return (
    <div>
      <AppPageHeader title={title} description={desc} />
      {records.length === 0 ? (
        <EmptyState title="No records" body={`No ${title.toLowerCase()} found.`} />
      ) : (
        <Card>
          <div className="space-y-2">
            {records.map((r) => (
              <Link
                key={r.id}
                to="/app/personnel/$id"
                params={{ id: r.id }}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm transition hover:bg-muted/60"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {r.number} — {String(r.data.name ?? "—")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {String(r.data.sectors ?? "—")} · {String(r.data.frameworks ?? "—")}
                  </p>
                </div>
                <span className="text-xs capitalize text-muted-foreground">
                  {r.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
