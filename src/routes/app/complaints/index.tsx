import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { complaints } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/")({
  head: () => ({ meta: [{ title: "Complaint Register — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={complaints}
      moduleKey="complaints"
      routeBase="/app/complaints"
      description="Complaints register with independent investigation and decision workflows."
    />
  ),
});
