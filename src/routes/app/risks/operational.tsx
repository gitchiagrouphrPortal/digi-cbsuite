import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/operational")({
  head: () => ({ meta: [{ title: "Operational Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Operational Risks"
      description="Operational risks including resource gaps, scheduling and process execution."
      category="operational"
    />
  ),
});
