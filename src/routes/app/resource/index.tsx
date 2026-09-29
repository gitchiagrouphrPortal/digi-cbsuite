import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { resourceGaps } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/")({
  head: () => ({ meta: [{ title: "Resource Gap Register — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={resourceGaps}
      moduleKey="resource"
      routeBase="/app/resource"
      description="New-scheme readiness assessments with evidence-based gap percentages and action plans."
    />
  ),
});
