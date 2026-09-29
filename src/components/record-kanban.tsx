// DigiCB Kanban view — drag-drop stage workflow with:
//  • required reason + audit log on every move
//  • stage gating (entry/exit criteria, required documents)
//  • missing-document alerts on cards
//  • active accreditation-framework filtering via the top-bar quick switch
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn, moveStageFn } from "@/lib/records.functions";
import type { CollectionDef, RecordDTO } from "@/lib/records-schema";
import { AppPageHeader } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";
import { useFramework, recordMatchesFramework } from "@/lib/framework-context";
import { getStageGate, missingGateItems } from "@/lib/kanban-gates";
import { toast } from "sonner";
import { Loader2, AlertTriangle, FileWarning, CheckCircle2 } from "lucide-react";

export function KanbanView({
  def,
  moduleKey,
  routeBase,
  fixedFilter,
}: {
  def: CollectionDef;
  moduleKey: string;
  routeBase: string;
  fixedFilter?: { framework?: string; branchId?: string };
}) {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canEdit = roleHas(moduleKey, perms);
  const { framework } = useFramework();
  const list = useServerFn(listRecordsFn);
  const move = useServerFn(moveStageFn);
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [reasonFor, setReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  // Blocked-move modal (stage gating failure)
  const [blocked, setBlocked] = useState<{ stage: string; missing: string[] } | null>(null);

  const stages = def.workflow ?? def.statuses;
  const stageIndex = useMemo(
    () => Object.fromEntries(stages.map((s, i) => [s.value, i])),
    [stages],
  );

  const load = async () => {
    setLoading(true);
    const res = await list({ data: { collection: def.key, archived: false, ...fixedFilter } });
    setRecords(res.records);
    setLoading(false);
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [def.key]);

  // Apply the active framework preset client-side (covers seed data where the
  // framework may live on data.framework rather than the top-level field).
  const visible = useMemo(
    () => records.filter((r) => recordMatchesFramework(r, framework)),
    [records, framework],
  );

  const onDrop = (stage: string) => {
    if (!dragId) return;
    const rec = visible.find((r) => r.id === dragId);
    if (!rec || rec.status === stage) {
      setDragId(null);
      return;
    }
    // Stage gating: forward moves require the current stage's exit criteria
    // (required documents) to be satisfied. Backward moves are always allowed.
    const forward = stageIndex[stage] > stageIndex[rec.status];
    if (forward) {
      const gate = getStageGate(def.key, rec.status);
      const missing = missingGateItems(rec, gate);
      if (missing.length > 0) {
        setBlocked({ stage, missing });
        setDragId(null);
        return;
      }
    }
    setReasonFor(stage);
  };

  const confirmMove = async () => {
    if (!reasonFor || !dragId) return;
    setBusy(true);
    try {
      const res = await move({
        data: { collection: def.key, id: dragId, stage: reasonFor, reason },
      });
      if (res.ok) {
        toast.success("Stage moved");
        await load();
      } else {
        toast.error("Move failed");
      }
    } catch {
      toast.error("Move failed");
    } finally {
      setReasonFor(null);
      setReason("");
      setDragId(null);
      setBusy(false);
    }
  };

  const targetStage = reasonFor ? stages.find((s) => s.value === reasonFor) : null;

  return (
    <div>
      <AppPageHeader
        title={`${def.singular} Kanban`}
        description="Drag cards between stages. Forward moves are gated by required documents; every move requires a reason and is audit-logged."
      />
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 kanban-scroll">
          {stages.map((stage) => {
            const items = visible.filter((r) => r.status === stage.value);
            const gate = getStageGate(def.key, stage.value);
            return (
              <div
                key={stage.value}
                onDragOver={(e) => canEdit && e.preventDefault()}
                onDrop={() => canEdit && onDrop(stage.value)}
                className="w-72 shrink-0 rounded-xl border border-border bg-muted/30 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={stage.value} label={stage.label} />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {items.length}
                    </span>
                  </div>
                  {gate?.exitCriteria && (
                    <span title={gate.exitCriteria.join(" · ")}>
                      <FileWarning className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {items.map((r) => {
                    const missing = missingGateItems(r, getStageGate(def.key, r.status));
                    return (
                      <Link
                        key={r.id}
                        to={`${routeBase}/${r.id}`}
                        draggable={canEdit}
                        onDragStart={() => setDragId(r.id)}
                        className="block rounded-lg border border-border bg-card p-3 shadow-sm transition hover:border-primary/40 hover:shadow"
                      >
                        <p className="font-mono text-[11px] font-semibold text-primary">
                          {r.number}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
                          {String(
                            r.data.title ??
                              r.data.organizationName ??
                              r.data.clientName ??
                              def.singular,
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                          {r.data.standard && (
                            <span className="rounded bg-muted px-1.5 py-0.5">
                              {String(r.data.standard)}
                            </span>
                          )}
                          {r.data.clientName && (
                            <span className="rounded bg-muted px-1.5 py-0.5">
                              {String(r.data.clientName)}
                            </span>
                          )}
                          {r.data.dueDate && (
                            <span className="rounded bg-muted px-1.5 py-0.5">
                              {String(r.data.dueDate)}
                            </span>
                          )}
                        </div>
                        {missing.length > 0 ? (
                          <div className="mt-2 flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-[10px] font-medium text-destructive">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {missing.length} missing: {missing.join(", ")}
                            </span>
                          </div>
                        ) : (
                          getStageGate(def.key, r.status)?.exitCriteria && (
                            <div className="mt-2 flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-[10px] font-medium text-success">
                              <CheckCircle2 className="h-3 w-3 shrink-0" /> Ready to advance
                            </div>
                          )
                        )}
                      </Link>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">No items</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reason modal */}
      {reasonFor && targetStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h3 className="font-display text-lg font-bold text-foreground">
              Move to {targetStage.label}
            </h3>
            {targetStage && getStageGate(def.key, reasonFor)?.entryCriteria && (
              <div className="mt-2 rounded-md bg-info/10 p-2 text-xs text-info">
                <p className="font-semibold">Entry criteria:</p>
                <ul className="ml-4 list-disc">
                  {getStageGate(def.key, reasonFor)!.entryCriteria!.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              Provide a reason for moving this card. This is recorded in the audit trail.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for stage change…"
              className="mt-3 min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setReasonFor(null);
                  setReason("");
                  setDragId(null);
                }}
                className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                disabled={busy || !reason.trim()}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />} Confirm move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blocked-move modal (stage gating) */}
      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Move blocked</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This card cannot advance until the required documents for the current stage are
                  complete. Complete the items below and try again.
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {blocked.missing.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                >
                  <FileWarning className="h-4 w-4 shrink-0" /> {m}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setBlocked(null)}
                className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
