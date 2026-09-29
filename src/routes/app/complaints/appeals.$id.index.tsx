import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { appeals } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/appeals/$id/")({
  head: () => ({ meta: [{ title: "Appeal — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={appeals}
        moduleKey="complaints"
        routeBase="/app/complaints/appeals"
        recordId={id}
      />
    );
  },
});
