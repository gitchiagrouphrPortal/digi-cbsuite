import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { communications } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/comms/")({
  head: () => ({ meta: [{ title: "Communication History — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={communications}
      moduleKey="crm"
      routeBase="/app/crm/comms"
      description="Logged communications with clients."
    />
  ),
});
