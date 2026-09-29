import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { certificates } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/certificates/templates")({
  head: () => ({ meta: [{ title: "Certificate Templates — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={certificates}
      moduleKey="certificates"
      routeBase="/app/certificates"
      description="Draft certificate templates awaiting issue."
      fixedFilter={{ statusIn: ["draft"] }}
    />
  ),
});
