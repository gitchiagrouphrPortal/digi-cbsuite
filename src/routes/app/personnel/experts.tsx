import { createFileRoute } from "@tanstack/react-router";
import { FilteredPersonnelView } from "@/components/filtered-personnel-view";
export const Route = createFileRoute("/app/personnel/experts")({
  head: () => ({ meta: [{ title: "Technical Experts — DigiCB" }] }),
  component: () => (
    <FilteredPersonnelView
      role="technical_expert"
      title="Technical Experts"
      desc="Technical experts by sector."
    />
  ),
});
