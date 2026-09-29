import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/framework")({
  head: () => ({ meta: [{ title: "Framework Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Framework Risks"
      description="Clause-linked risks organized by accreditation framework."
    />
  ),
});
