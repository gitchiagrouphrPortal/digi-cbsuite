import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/branch")({
  head: () => ({ meta: [{ title: "Branch Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Branch Risks"
      description="Risks related to branch-office control, head-office oversight and IAF MD 23 multi-site management."
      category="branch_control"
    />
  ),
});
