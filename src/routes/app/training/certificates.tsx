import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { enrolments } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/certificates")({
  head: () => ({ meta: [{ title: "Training Certificates — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={enrolments}
      moduleKey="training"
      routeBase="/app/training/batches"
      description="Training certificates with QR verification, CPD hours and learner records."
      fixedFilter={{ status: "certified" }}
    />
  ),
});
