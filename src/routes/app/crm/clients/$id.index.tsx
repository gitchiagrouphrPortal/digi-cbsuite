import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { clients } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/clients/$id/")({
  head: () => ({ meta: [{ title: "Organization — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView def={clients} moduleKey="crm" routeBase="/app/crm/clients" recordId={id} />
    );
  },
});
