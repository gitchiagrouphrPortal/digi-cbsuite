import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getApprovalsFn, resolveApprovalFn } from "@/lib/digicb.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { AppPageHeader, Card, DataTable, EmptyState, Pill } from "@/components/app-primitives";
import type { Approval } from "@/lib/digicb-types";

export const Route = createFileRoute("/app/approvals")({
  head: () => ({ meta: [{ title: "Pending Approvals — DigiCB" }] }),
  component: ApprovalsPage,
});

const STAGE_TONE: Record<Approval["stage"], "info" | "warning" | "danger" | "success" | "muted"> = {
  review: "info",
  feedback: "warning",
  changes: "warning",
  approved: "success",
  rejected: "danger",
};

function ApprovalsPage() {
  const { user } = useAuth();
  const getApprovals = useServerFn(getApprovalsFn);
  const resolve = useServerFn(resolveApprovalFn);
  const [approvals, setApprovals] = useState<Approval[] | null>(null);

  useEffect(() => {
    let active = true;
    getApprovals()
      .then((a) => active && setApprovals(a))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getApprovals]);

  const act = async (id: string, stage: Approval["stage"], label: string) => {
    try {
      const updated = await resolve({ data: { id, stage } });
      setApprovals(updated);
      toast.success(`${label} — approval updated`);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div>
      <AppPageHeader
        title="Pending Approvals"
        description="Central approval hub — review, request changes, approve or reject documents and records."
      />
      <Card>
        {!approvals ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : approvals.length === 0 ? (
          <EmptyState
            title="No approvals pending"
            body="Items routed for your approval will appear here."
          />
        ) : (
          <DataTable
            headers={["Document", "Type", "Submitted", "Stage", "Framework", "Actions"]}
            rows={approvals.map((a) => [
              <div>
                <p className="font-medium text-foreground">{a.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{a.docNumber}</p>
              </div>,
              <span className="text-muted-foreground">{a.type}</span>,
              <span className="text-muted-foreground">{a.submittedAt}</span>,
              <Pill tone={STAGE_TONE[a.stage]}>{a.stage}</Pill>,
              <span className="font-mono text-xs text-muted-foreground">{a.framework}</span>,
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => act(a.id, "approved", "Approved")}
                  className="rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/25"
                >
                  Approve
                </button>
                <button
                  onClick={() => act(a.id, "changes", "Changes requested")}
                  className="rounded-md bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning hover:bg-warning/25"
                >
                  Request changes
                </button>
                <button
                  onClick={() => act(a.id, "rejected", "Rejected")}
                  className="rounded-md bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/25"
                >
                  Reject
                </button>
              </div>,
            ])}
          />
        )}
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Signed in as {user?.email}. All approval actions are audit-logged and enforce segregation of
        duties.
      </p>
    </div>
  );
}
