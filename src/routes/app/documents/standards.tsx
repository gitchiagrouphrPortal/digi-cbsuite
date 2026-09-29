import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/standards")({
  head: () => ({ meta: [{ title: "Standards Library — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={documents}
      moduleKey="documents"
      routeBase="/app/documents"
      description="External standards and IAF / Global ACI mandatory documents."
    />
  ),
});
