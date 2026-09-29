import { createFileRoute } from "@tanstack/react-router";
import { FilteredPersonnelView } from "@/components/filtered-personnel-view";
export const Route = createFileRoute("/app/personnel/auditors")({
  head: () => ({ meta: [{ title: "Auditors — DigiCB" }] }),
  component: () => (
    <FilteredPersonnelView
      role="auditor"
      title="Auditors"
      desc="Registered auditors and team leaders."
    />
  ),
});
