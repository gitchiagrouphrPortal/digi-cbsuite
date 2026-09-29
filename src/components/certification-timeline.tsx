import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listRecordsFn, getCertificationTimelineFn } from "@/lib/records.functions";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { certificates } from "@/lib/records-collections-ext";
import { FRAMEWORKS } from "@/lib/records-constants";
import type { RecordDTO } from "@/lib/records-schema";
import type { TimelineStep } from "@/lib/records-timeline-types";

const PHASE_TONE: Record<string, "success" | "info" | "warning" | "danger" | "muted"> = {
  Application: "info",
  "Application Review": "warning",
  Contract: "info",
  "Certification Project": "info",
  Audit: "warning",
  Nonconformity: "danger",
  "Technical Review": "warning",
  "Certification Decision": "warning",
  Certificate: "success",
  Surveillance: "info",
  Recertification: "info",
  Suspension: "danger",
  Withdrawal: "muted",
};

export function CertificationTimelineView() {
  const [search, setSearch] = useState("");
  const [framework, setFramework] = useState("all");

  const certsQuery = useQuery({
    queryKey: ["records", "certificates"],
    queryFn: () => listRecordsFn({ data: { collection: "certificates" } }),
  });

  const issuedCerts = useMemo(() => {
    const all = (certsQuery.data?.records ?? []) as RecordDTO[];
    return all.filter(
      (c) =>
        c.status === "issued" ||
        c.status === "suspended" ||
        c.status === "expired" ||
        c.status === "withdrawn",
    );
  }, [certsQuery.data]);

  const filtered = useMemo(() => {
    return issuedCerts.filter((c) => {
      const text =
        `${c.number} ${c.data.clientName ?? ""} ${c.data.standard ?? ""} ${c.data.scope ?? ""}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesFramework =
        framework === "all" || (c.data.framework ?? c.framework) === framework;
      return matchesSearch && matchesFramework;
    });
  }, [issuedCerts, search, framework]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedCert = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null;

  const timelineQuery = useQuery({
    queryKey: ["certification-timeline", selectedCert?.id],
    queryFn: () => getCertificationTimelineFn({ data: { certificateId: selectedCert!.id } }),
    enabled: !!selectedCert,
  });

  const timeline = timelineQuery.data;
  const steps = timeline?.steps ?? [];
  const milestones = timeline?.milestones ?? [];

  return (
    <div>
      <AppPageHeader
        title="Certification Lifecycle Timeline"
        description="End-to-end tracking flow for every certified client — from inquiry through audit, NCR, decision and certificate issuance, with who, when and which process completed."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Certified Clients</h3>
            <span className="text-xs text-muted-foreground">
              {filtered.length} of {issuedCerts.length}
            </span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, standard, scope…"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Frameworks</option>
            {FRAMEWORKS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
            {certsQuery.isLoading && (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
            )}
            {filtered.length === 0 && !certsQuery.isLoading && (
              <EmptyState message="No certified clients found." />
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selectedCert?.id === c.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{c.number}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {String(c.data.clientName ?? "—")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {String(c.data.standard ?? "—")} ·{" "}
                  {String(c.data.framework ?? c.framework ?? "—")}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-4">
          {!selectedCert ? (
            <EmptyState message="Select a certified client to view the full lifecycle timeline." />
          ) : timelineQuery.isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading timeline…</div>
          ) : !timeline ? (
            <EmptyState message="No lifecycle data found for this certificate." />
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="text-xs font-semibold text-primary">
                    {timeline.certificateNumber}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{timeline.clientName}</h2>
                  <div className="text-sm text-muted-foreground">
                    {timeline.standard ?? "—"} · {timeline.framework ?? "—"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={timeline.certificateStatus ?? "issued"} />
                  <span className="text-xs text-muted-foreground">
                    {steps.length} events tracked
                  </span>
                </div>
              </div>

              {milestones.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {milestones.map((m) => (
                    <span
                      key={m.id}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        m.completed
                          ? "bg-green-500/15 text-green-700 dark:text-green-400"
                          : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {m.completed ? "✓" : "○"} {m.process}
                    </span>
                  ))}
                </div>
              )}

              <TimelineFlow steps={steps} />

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/app/certificates/$id"
                  params={{ id: selectedCert.id }}
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Open Certificate
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TimelineFlow({ steps }: { steps: TimelineStep[] }) {
  if (steps.length === 0) {
    return <EmptyState message="No lifecycle events found for this certificate." />;
  }

  return (
    <ol className="relative border-l border-border pl-6">
      {steps.map((step) => {
        const tone = PHASE_TONE[step.phase] ?? "muted";
        const dotColor =
          tone === "success"
            ? "bg-green-500"
            : tone === "warning"
              ? "bg-amber-500"
              : tone === "danger"
                ? "bg-red-500"
                : tone === "info"
                  ? "bg-blue-500"
                  : "bg-muted-foreground";
        return (
          <li key={step.id} className="mb-6 last:mb-0">
            <span
              className={`absolute -left-[7px] mt-1.5 h-3.5 w-3.5 rounded-full border-2 border-background ${dotColor}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{step.process}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {step.phase}
              </span>
              {step.completed ? (
                <span className="rounded bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
                  Completed
                </span>
              ) : (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  Pending
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {step.date
                ? new Date(step.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
              {step.dateTime
                ? ` · ${new Date(step.dateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ""}
            </div>
            {step.detail && <div className="mt-1 text-sm text-foreground">{step.detail}</div>}
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">Who:</span> {step.actor || "—"}
              </span>
              <span>
                <span className="font-medium text-foreground">Role:</span> {step.role || "—"}
              </span>
              <span>
                <span className="font-medium text-foreground">Ref:</span> {step.recordNumber}
              </span>
            </div>
            <Link
              to={`/app/${recordCollectionRoute(step.recordCollection)}/${step.recordId}`}
              className="mt-1 inline-block text-[11px] font-medium text-primary hover:underline"
            >
              Open source record →
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function recordCollectionRoute(collection: string): string {
  const map: Record<string, string> = {
    applications: "applications",
    contracts: "crm/contracts",
    projects: "projects",
    audits: "audits/programmes",
    ncrs: "ncr",
    decisions: "decisions",
    certificates: "certificates",
  };
  return map[collection] ?? "certificates";
}
