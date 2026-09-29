import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/impartiality")({
  head: () => ({ meta: [{ title: "Impartiality Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Impartiality Risks"
      description="Risks to impartiality, independence and segregation of duties across certification activities."
      category="impartiality"
    />
  ),
});
