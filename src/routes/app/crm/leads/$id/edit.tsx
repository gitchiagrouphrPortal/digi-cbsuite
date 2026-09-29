import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { leads } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/leads/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Lead — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return <RecordFormView def={leads} moduleKey="crm" routeBase="/app/crm/leads" recordId={id} />;
  },
});
