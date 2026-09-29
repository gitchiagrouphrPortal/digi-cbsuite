import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/security")({
  head: () => ({ meta: [{ title: "Information Security Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Information Security Risks"
      description="Confidentiality, access control and data protection risks across client and certification records."
      category="information_security"
    />
  ),
});
