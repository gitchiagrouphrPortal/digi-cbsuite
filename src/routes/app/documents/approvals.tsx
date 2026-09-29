import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/approvals")({
  head: () => ({ meta: [{ title: "Documents Awaiting Approval — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={documents}
      moduleKey="documents"
      routeBase="/app/documents"
      description="Documents awaiting central approval."
      fixedFilter={{ statusIn: ["approval"] }}
    />
  ),
});
