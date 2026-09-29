import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { resourceGaps } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/$id/")({
  head: () => ({ meta: [{ title: "Resource Gap Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={resourceGaps}
        moduleKey="resource"
        routeBase="/app/resource"
        recordId={id}
      />
    );
  },
});
