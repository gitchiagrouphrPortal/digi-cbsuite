import { useQuery } from "@tanstack/react-query";
import { getCertificationTimelineFn } from "@/lib/records.functions";
import { EmptyState } from "@/components/app-primitives";
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

export function CertificationTimelineTab({ record }: { record: RecordDTO }) {
  const q = useQuery({
    queryKey: ["certification-timeline", record.id],
    queryFn: () => getCertificationTimelineFn({ data: { certificateId: record.id } }),
  });

  if (q.isLoading)
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading timeline…</div>;
  const timeline = q.data;
  if (!timeline || timeline.steps.length === 0)
    return <EmptyState message="No lifecycle events tracked yet for this certificate." />;

  const steps = timeline.steps;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {timeline.milestones.map((m) => (
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

      <ol className="relative border-l border-border pl-6">
        {steps.map((step: TimelineStep) => {
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
            <li key={step.id} className="mb-5 last:mb-0">
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
            </li>
          );
        })}
      </ol>
    </div>
  );
}
