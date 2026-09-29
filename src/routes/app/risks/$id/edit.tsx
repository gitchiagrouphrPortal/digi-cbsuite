import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { RISKS_COLLECTION } from "@/lib/records-risks-collection";

export const Route = createFileRoute("/app/risks/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Risk Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={RISKS_COLLECTION}
        moduleKey="risks"
        routeBase="/app/risks"
        recordId={id}
      />
    );
  },
});
