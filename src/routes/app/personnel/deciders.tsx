import { createFileRoute } from "@tanstack/react-router";
import { FilteredPersonnelView } from "@/components/filtered-personnel-view";
export const Route = createFileRoute("/app/personnel/deciders")({
  head: () => ({ meta: [{ title: "Decision-Makers — DigiCB" }] }),
  component: () => (
    <FilteredPersonnelView
      role="decision_maker"
      title="Decision-Makers"
      desc="Authorized certification decision-makers."
    />
  ),
});
