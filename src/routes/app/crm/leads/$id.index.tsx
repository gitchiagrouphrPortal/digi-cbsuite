import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { leads } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/leads/$id/")({
  head: () => ({ meta: [{ title: "Lead — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView def={leads} moduleKey="crm" routeBase="/app/crm/leads" recordId={id} />
    );
  },
});
