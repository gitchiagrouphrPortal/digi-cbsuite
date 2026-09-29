import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { certificates } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/certificates/issued")({
  head: () => ({ meta: [{ title: "Issued Certificates — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={certificates}
      moduleKey="certificates"
      routeBase="/app/certificates"
      description="Currently issued and valid certificates."
      fixedFilter={{ statusIn: ["issued"] }}
    />
  ),
});
