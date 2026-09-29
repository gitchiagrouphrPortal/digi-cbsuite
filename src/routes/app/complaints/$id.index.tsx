import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { complaints } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/$id/")({
  head: () => ({ meta: [{ title: "Complaint — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={complaints}
        moduleKey="complaints"
        routeBase="/app/complaints"
        recordId={id}
      />
    );
  },
});
