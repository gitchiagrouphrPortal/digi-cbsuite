import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { enrolments } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/training/batches/$id/")({
  head: () => ({ meta: [{ title: "Training Batch Details — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={enrolments}
        moduleKey="training"
        routeBase="/app/training/batches"
        recordId={id}
      />
    );
  },
});
