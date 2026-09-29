import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { complaints } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/investigation")({
  head: () => ({ meta: [{ title: "Complaint Investigation — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={complaints}
      moduleKey="complaints"
      routeBase="/app/complaints"
      description="Complaints currently under independent investigation."
      fixedFilter={{ statusIn: ["new", "acknowledged", "investigation"] }}
    />
  ),
});
