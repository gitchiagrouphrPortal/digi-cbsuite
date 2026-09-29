import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { enrolments } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/assessments")({
  head: () => ({ meta: [{ title: "Assessments — DigiCB" }] }),
  component: () => (
    <RecordListView
      def={enrolments}
      moduleKey="training"
      routeBase="/app/training/batches"
      description="Examination results, scores, retakes and examiner/invigilator controls."
      fixedFilter={{ statusIn: ["examined", "passed", "failed", "certified"] }}
    />
  ),
});
