import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { enrolments } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/batches/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Training Batch — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={enrolments}
        moduleKey="training"
        routeBase="/app/training/batches"
        recordId={id}
      />
    );
  },
});
