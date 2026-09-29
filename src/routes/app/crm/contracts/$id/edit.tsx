import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { contracts } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/contracts/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Contract — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={contracts}
        moduleKey="crm"
        routeBase="/app/crm/contracts"
        recordId={id}
      />
    );
  },
});
