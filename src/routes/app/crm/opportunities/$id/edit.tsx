import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { opportunities } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/opportunities/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Opportunity — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={opportunities}
        moduleKey="crm"
        routeBase="/app/crm/opportunities"
        recordId={id}
      />
    );
  },
});
