import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/review")({
  head: () => ({ meta: [{ title: "Application Review — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <RecordListView
      def={applications}
      moduleKey="applications"
      routeBase="/app/applications"
      description="Applications awaiting or under reviewer decision."
      fixedFilter={{
        statusIn: ["submitted", "under_review", "more_info", "resource_review", "conflict_check"],
      }}
    />
  );
}
