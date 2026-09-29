import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { quotations } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/quotations/$id/")({
  head: () => ({ meta: [{ title: "Quotation — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={quotations}
        moduleKey="crm"
        routeBase="/app/crm/quotations"
        recordId={id}
      />
    );
  },
});
