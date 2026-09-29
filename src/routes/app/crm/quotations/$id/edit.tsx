import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { quotations } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/quotations/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Quotation — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={quotations}
        moduleKey="crm"
        routeBase="/app/crm/quotations"
        recordId={id}
      />
    );
  },
});
