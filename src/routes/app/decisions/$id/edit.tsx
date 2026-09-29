import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { decisions } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/decisions/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Decision — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={decisions}
        moduleKey="decisions"
        routeBase="/app/decisions"
        recordId={id}
      />
    );
  },
});
