// DigiCB app page primitives (inside the authenticated shell).
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Generic CSV export for arbitrary row objects. Independent of the record
// collection definition so report pages can export their own shapes.
export function exportRowsCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AppPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-base font-semibold text-foreground", className)}>
      {children}
    </h2>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <p className="font-medium text-foreground">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatTone({ tone }: { tone: string }) {
  const map: Record<string, string> = {
    info: "text-info",
    warning: "text-warning",
    danger: "text-destructive",
    success: "text-success",
  };
  return <span className={map[tone] ?? "text-foreground"} />;
}

export function Pill({
  tone,
  children,
}: {
  tone: "info" | "warning" | "danger" | "success" | "muted";
  children: ReactNode;
}) {
  const map: Record<string, string> = {
    info: "bg-info/15 text-info border-info/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    success: "bg-success/15 text-success border-success/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="bg-card hover:bg-muted/40">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PlannedModule({
  title,
  description,
}: {
  title: string;
  description: string;
  phase?: string;
}) {
  return (
    <div>
      <AppPageHeader title={title} description={description} />
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <span className="text-lg">ⓘ</span>
          </div>
          <div>
            <SectionTitle className="text-base">{title}</SectionTitle>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
            <p className="mt-3 text-xs font-medium text-primary">
              Use the sidebar to navigate to the available records for this module.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
