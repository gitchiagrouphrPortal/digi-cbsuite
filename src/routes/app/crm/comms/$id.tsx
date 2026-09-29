import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { communications } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/comms/$id")({
  head: () => ({ meta: [{ title: "Communication — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={communications}
        moduleKey="crm"
        routeBase="/app/crm/comms"
        recordId={id}
      />
    );
  },
});
