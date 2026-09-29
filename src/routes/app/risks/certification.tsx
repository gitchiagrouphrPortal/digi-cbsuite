import { createFileRoute } from "@tanstack/react-router";
import { FilteredRiskView } from "@/components/filtered-risk-view";

export const Route = createFileRoute("/app/risks/certification")({
  head: () => ({ meta: [{ title: "Certification Process Risks — DigiCB" }] }),
  component: () => (
    <FilteredRiskView
      title="Certification Process Risks"
      description="Risks affecting application review, audit duration, findings, decisions and certificate lifecycle."
      category="certification_process"
    />
  ),
});
