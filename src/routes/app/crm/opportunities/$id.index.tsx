import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { opportunities } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/opportunities/$id/")({
  head: () => ({ meta: [{ title: "Opportunity — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={opportunities}
        moduleKey="crm"
        routeBase="/app/crm/opportunities"
        recordId={id}
      />
    );
  },
});
