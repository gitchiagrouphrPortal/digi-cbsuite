import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { clients } from "@/lib/records-collections";

export const Route = createFileRoute("/app/crm/clients/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Organization — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView def={clients} moduleKey="crm" routeBase="/app/crm/clients" recordId={id} />
    );
  },
});
