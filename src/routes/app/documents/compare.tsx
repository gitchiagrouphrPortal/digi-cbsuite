// DigiCB controlled-document visual diff comparison.
// Side-by-side + unified line-by-line diff with colour highlighting for
// additions (green), deletions (red) and unchanged (muted) lines — used for
// supersession reviews.
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn } from "@/lib/records.functions";
import type { RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/documents/compare")({
  head: () => ({ meta: [{ title: "Document Comparison — DigiCB" }] }),
  component: Page,
});

type DiffRow =
  { type: "same"; text: string } | { type: "add"; text: string } | { type: "del"; text: string };

// LCS-based line diff. Produces ordered rows of same / add / del.
function diffLines(a: string[], b: string[]): DiffRow[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const rows: DiffRow[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: "del", text: a[i] });
      i++;
    } else {
      rows.push({ type: "add", text: b[j] });
      j++;
    }
  }
  while (i < n) rows.push({ type: "del", text: a[i++] });
  while (j < m) rows.push({ type: "add", text: b[j++] });
  return rows;
}

function Page() {
  const list = useServerFn(listRecordsFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  useEffect(() => {
    list({ data: { collection: "documents", archived: false } })
      .then((r) => {
        setRecords(r.records);
        if (r.records[0]) setA(r.records[0].id);
        if (r.records[1]) setB(r.records[1].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [list]);
  if (loading)
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  const ra = records.find((r) => r.id === a);
  const rb = records.find((r) => r.id === b);
  const linesA = String(ra?.data.content ?? "").split("\n");
  const linesB = String(rb?.data.content ?? "").split("\n");
  const diff = ra && rb ? diffLines(linesA, linesB) : [];
  const added = diff.filter((d) => d.type === "add").length;
  const removed = diff.filter((d) => d.type === "del").length;

  return (
    <div>
      <AppPageHeader
        title="Document Comparison"
        description="Side-by-side and unified visual diff of two controlled document versions for supersession review."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-foreground">Version A (older)</span>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} — {String(r.data.title ?? "")} v{String(r.data.version ?? "")}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-foreground">Version B (newer)</span>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.number} — {String(r.data.title ?? "")} v{String(r.data.version ?? "")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!ra || !rb ? (
        <EmptyState title="Select two documents" body="Choose two document versions to compare." />
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <Card className="flex flex-wrap items-center gap-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full border border-success/30 bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                +{added} added
              </span>
              <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                −{removed} removed
              </span>
              <span className="text-xs text-muted-foreground">
                {diff.length} total lines compared
              </span>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {ra.number} v{String(ra.data.version ?? "")} → {rb.number} v
              {String(rb.data.version ?? "")}
            </div>
          </Card>

          {/* Side-by-side with per-line highlighting */}
          <Card className="overflow-hidden p-0">
            <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
              <div className="bg-muted/40 px-4 py-2">
                <p className="font-mono text-xs font-semibold text-foreground">
                  {ra.number} v{String(ra.data.version ?? "")}
                </p>
                <p className="text-[11px] text-muted-foreground">{String(ra.data.status ?? "")}</p>
              </div>
              <div className="bg-muted/40 px-4 py-2">
                <p className="font-mono text-xs font-semibold text-foreground">
                  {rb.number} v{String(rb.data.version ?? "")}
                </p>
                <p className="text-[11px] text-muted-foreground">{String(rb.data.status ?? "")}</p>
              </div>
            </div>
            <div className="max-h-[420px] grid grid-cols-2 overflow-y-auto divide-x divide-border">
              <div className="font-mono text-xs">
                {linesA.map((line, idx) => {
                  const inB = linesB.includes(line);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "whitespace-pre-wrap px-3 py-0.5",
                        inB
                          ? "text-muted-foreground"
                          : "bg-destructive/10 text-destructive line-through",
                      )}
                    >
                      <span className="mr-2 select-none text-muted-foreground/50">
                        {String(idx + 1).padStart(3, " ")}
                      </span>
                      {line || " "}
                    </div>
                  );
                })}
              </div>
              <div className="font-mono text-xs">
                {linesB.map((line, idx) => {
                  const inA = linesA.includes(line);
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "whitespace-pre-wrap px-3 py-0.5",
                        inA ? "text-muted-foreground" : "bg-success/10 text-success",
                      )}
                    >
                      <span className="mr-2 select-none text-muted-foreground/50">
                        {String(idx + 1).padStart(3, " ")}
                      </span>
                      {line || " "}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Unified diff */}
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border bg-muted/40 px-4 py-2">
              <p className="font-display text-sm font-semibold text-foreground">Unified diff</p>
            </div>
            <div className="max-h-[420px] overflow-y-auto font-mono text-xs">
              {diff.map((row, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 whitespace-pre-wrap px-3 py-0.5",
                    row.type === "add" && "bg-success/10 text-success",
                    row.type === "del" && "bg-destructive/10 text-destructive line-through",
                    row.type === "same" && "text-muted-foreground",
                  )}
                >
                  <span className="w-4 select-none font-bold">
                    {row.type === "add" ? "+" : row.type === "del" ? "−" : " "}
                  </span>
                  <span className="flex-1">{row.text || " "}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
