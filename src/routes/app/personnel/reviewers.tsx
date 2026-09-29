import { createFileRoute } from "@tanstack/react-router";
import { FilteredPersonnelView } from "@/components/filtered-personnel-view";
export const Route = createFileRoute("/app/personnel/reviewers")({
  head: () => ({ meta: [{ title: "Reviewers — DigiCB" }] }),
  component: () => (
    <FilteredPersonnelView
      role="reviewer"
      title="Reviewers"
      desc="Application and technical reviewers."
    />
  ),
});
