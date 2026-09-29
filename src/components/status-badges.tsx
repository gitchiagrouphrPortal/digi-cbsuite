import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  current: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  accepted: "bg-success/15 text-success border-success/30",
  closed: "bg-success/15 text-success border-success/30",
  transition: "bg-warning/15 text-warning border-warning/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  due: "bg-warning/15 text-warning border-warning/30",
  review: "bg-info/15 text-info border-info/30",
  open: "bg-info/15 text-info border-info/30",
  draft: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  withdrawn: "bg-destructive/15 text-destructive border-destructive/30",
  superseded: "bg-muted text-muted-foreground border-border",
  blocked: "bg-destructive/15 text-destructive border-destructive/30",
};

const PERM_STYLES: Record<string, string> = {
  full: "bg-success/15 text-success",
  branch: "bg-info/15 text-info",
  read: "bg-muted text-muted-foreground",
  none: "bg-transparent text-muted-foreground/50",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const cls = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        cls,
      )}
    >
      {label ?? status}
    </span>
  );
}

export function PermCell({ level }: { level: "full" | "branch" | "read" | "none" }) {
  const symbols: Record<string, string> = { full: "●", branch: "◑", read: "○", none: "—" };
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold",
        PERM_STYLES[level],
      )}
      title={level}
    >
      {symbols[level]}
    </span>
  );
}

export function FrameworkChip({ id, label }: { id: string; label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground">
      {label}
    </span>
  );
}
