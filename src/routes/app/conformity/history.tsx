import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppPageHeader, Card } from "@/components/app-primitives";
import { History } from "lucide-react";

export const Route = createFileRoute("/app/conformity/history")({
  head: () => ({
    meta: [
      { title: "Assessment History — DigiCB" },
      {
        name: "description",
        content: "Historical compliance snapshots and assessment audit trail.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Assessment History"
        description="Historical compliance snapshots preserved when records or evidence change. All scoring changes, mappings, assessments and approvals are audit-logged."
      >
        <Link
          to="/app/admin/audit"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          View Audit Logs
        </Link>
      </AppPageHeader>

      <Card>
        <div className="flex flex-col items-center py-6">
          <History className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-medium text-foreground">Compliance snapshots</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Periodic compliance snapshots are preserved so historical trends remain available when
            records or evidence change. Snapshots are generated when assessments are approved or at
            scheduled intervals.
          </p>
        </div>
        <div className="mt-4 rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Audit-logged events include:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-xs">
            <li>Clause assessment creation, review and approval</li>
            <li>Compliance score changes (previous → new value)</li>
            <li>Module-clause mapping additions and removals</li>
            <li>Evidence registration, linking and validity changes</li>
            <li>Not Applicable approvals with justification</li>
            <li>Framework and standard configuration changes</li>
            <li>Report exports</li>
          </ul>
          <p className="mt-3 text-xs">
            View the full immutable audit trail in Administration → Audit Logs.
          </p>
        </div>
      </Card>
    </div>
  );
}
