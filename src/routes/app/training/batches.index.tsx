import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { enrolments } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/batches/")({
  head: () => ({ meta: [{ title: "Batches — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={enrolments}
      moduleKey="training"
      routeBase="/app/training/batches"
      description="Training batches with enrolment, attendance, examination and certification status."
    />
  ),
});
