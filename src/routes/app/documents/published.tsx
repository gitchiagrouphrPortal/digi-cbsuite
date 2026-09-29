import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/published")({
  head: () => ({ meta: [{ title: "Published Documents — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={documents}
      moduleKey="documents"
      routeBase="/app/documents"
      description="Currently published controlled documents."
      fixedFilter={{ statusIn: ["published", "periodic_review"] }}
    />
  ),
});
