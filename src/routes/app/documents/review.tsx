import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/review")({
  head: () => ({ meta: [{ title: "Documents Under Review — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={documents}
      moduleKey="documents"
      routeBase="/app/documents"
      description="Documents currently under review."
      fixedFilter={{ statusIn: ["review", "changes_requested"] }}
    />
  ),
});
