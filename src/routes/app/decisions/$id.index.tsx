import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/$id/")({
  head: () => ({ meta: [{ title: "Decision — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={decisions}
        moduleKey="decisions"
        routeBase="/app/decisions"
        recordId={id}
      />
    );
  },
});
