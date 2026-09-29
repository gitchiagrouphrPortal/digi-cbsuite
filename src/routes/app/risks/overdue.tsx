import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/overdue")({
  head: () => ({ meta: [{ title: "Overdue Risk Actions — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Overdue Risk Actions"
      description="Risks with treatment target dates past due and not yet closed."
      overdueOnly
    />
  ),
});
