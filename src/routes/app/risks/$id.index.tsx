import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { RISKS_COLLECTION } from "@/lib/records-risks-collection";

export const Route = createFileRoute("/app/risks/$id/")({
  head: () => ({ meta: [{ title: "Risk Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={RISKS_COLLECTION}
        moduleKey="risks"
        routeBase="/app/risks"
        recordId={id}
      />
    );
  },
});
