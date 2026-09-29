import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { certificates } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/certificates/suspended")({
  head: () => ({ meta: [{ title: "Suspended Certificates — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={certificates}
      moduleKey="certificates"
      routeBase="/app/certificates"
      description="Suspended and withdrawn certificates."
      fixedFilter={{ statusIn: ["suspended", "withdrawn"] }}
    />
  ),
});
