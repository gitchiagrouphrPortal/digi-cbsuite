import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { contracts } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/contracts/$id/")({
  head: () => ({ meta: [{ title: "Contract — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={contracts}
        moduleKey="crm"
        routeBase="/app/crm/contracts"
        recordId={id}
      />
    );
  },
});
