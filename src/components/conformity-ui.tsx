// DigiCB Conformity UI primitives — semantic tokens only.
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  not_assessed: "Not Assessed",
  in_progress: "In Progress",
  conforming: "Conforming",
  partial: "Partially Conforming",
  nonconforming: "Nonconforming",
  evidence_missing: "Evidence Missing",
  evidence_expired: "Evidence Expired",
  not_applicable: "Not Applicable",
  pending_review: "Pending Review",
  corrective_action_open: "Corrective Action Open",
  verification_pending: "Verification Pending",
  closed: "Closed",
  draft: "Draft",
  current: "Current",
  transition: "Transition",
  withdrawn: "Withdrawn",
  superseded: "Superseded",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_TONE: Record<string, string> = {
  conforming: "bg-success/15 text-success border-success/30",
  closed: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  current: "bg-success/15 text-success border-success/30",
  partial: "bg-warning/15 text-warning border-warning/30",
  corrective_action_open: "bg-warning/15 text-warning border-warning/30",
  verification_pending: "bg-warning/15 text-warning border-warning/30",
  pending_review: "bg-warning/15 text-warning border-warning/30",
  transition: "bg-warning/15 text-warning border-warning/30",
  nonconforming: "bg-destructive/15 text-destructive border-destructive/30",
  evidence_missing: "bg-destructive/15 text-destructive border-destructive/30",
  evidence_expired: "bg-destructive/15 text-destructive border-destructive/30",
  withdrawn: "bg-destructive/15 text-destructive border-destructive/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  superseded: "bg-muted text-muted-foreground border-border",
  not_assessed: "bg-muted text-muted-foreground border-border",
  not_applicable: "bg-info/15 text-info border-info/30",
  in_progress: "bg-info/15 text-info border-info/30",
  draft: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({
  status,
  label,
  compact,
}: {
  status: string;
  label?: string;
  compact?: boolean;
}) {
  const text = label ?? STATUS_LABELS[status] ?? status;
  const tone = STATUS_TONE[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        tone,
      )}
    >
      {text}
    </span>
  );
}

export function complianceColor(pct: number): { bg: string; text: string; label: string } {
  if (pct >= 90) return { bg: "bg-success", text: "text-success", label: "High" };
  if (pct >= 80) return { bg: "bg-success/80", text: "text-success", label: "Good" };
  if (pct >= 60) return { bg: "bg-warning", text: "text-warning", label: "Fair" };
  if (pct >= 40) return { bg: "bg-warning/70", text: "text-warning", label: "Low" };
  return { bg: "bg-destructive", text: "text-destructive", label: "Critical" };
}

export function ComplianceBadge({ pct }: { pct: number }) {
  const c = complianceColor(pct);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold",
        c.bg,
        "text-white",
      )}
    >
      {pct}%
    </span>
  );
}

export function ComplianceBar({ pct, label }: { pct: number; label?: string }) {
  const c = complianceColor(pct);
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={cn("font-bold", c.text)}>{pct}%</span>
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", c.bg)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ComplianceRing({
  pct,
  label,
  sub,
  size = "md",
}: {
  pct: number;
  label: string;
  sub?: string;
  size?: "sm" | "md";
}) {
  const c = complianceColor(pct);
  const dim = size === "sm" ? 80 : 120;
  const stroke = size === "sm" ? 7 : 10;
  const r = (dim - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center" style={{ width: dim }}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        <circle
          cx={dim / 2}
          cy={dim / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700", c.text)}
        />
      </svg>
      <div
        className="-mt-[60%] flex flex-col items-center"
        style={{ marginTop: size === "sm" ? -52 : -78 }}
      >
        <span
          className={cn("font-display font-bold", size === "sm" ? "text-lg" : "text-2xl", c.text)}
        >
          {pct}%
        </span>
      </div>
      <p
        className={cn(
          "mt-2 text-center font-medium text-foreground",
          size === "sm" ? "text-[10px]" : "text-xs",
        )}
      >
        {label}
      </p>
      {sub && <p className="text-center text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("font-display text-xl font-bold", tone ?? "text-foreground")}>{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FrameworkTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: string) => void;
}) {
  const tabs = [
    { value: "all", label: "All" },
    { value: "fw_17021", label: "ISO/IEC 17021-1" },
    { value: "fw_ps4992", label: "PS 4992" },
    { value: "fw_17024", label: "ISO/IEC 17024" },
    { value: "fw_17065", label: "ISO/IEC 17065" },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            active === t.value
              ? "bg-primary text-primary-foreground"
              : "border border-input bg-background text-foreground hover:bg-accent",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ClauseLink({ clauseId, number }: { clauseId: string; number: string }) {
  return (
    <Link
      to="/app/conformity/clauses"
      className="font-mono text-xs font-semibold text-primary hover:underline"
    >
      {number}
    </Link>
  );
}
