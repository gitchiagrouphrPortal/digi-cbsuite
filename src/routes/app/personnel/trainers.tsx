import { createFileRoute } from "@tanstack/react-router";
import { FilteredPersonnelView } from "@/components/filtered-personnel-view";
export const Route = createFileRoute("/app/personnel/trainers")({
  head: () => ({ meta: [{ title: "Trainers & Examiners — DigiCB" }] }),
  component: () => (
    <FilteredPersonnelView
      role="trainer"
      title="Trainers & Examiners"
      desc="Authorized course trainers and examiners."
    />
  ),
});
