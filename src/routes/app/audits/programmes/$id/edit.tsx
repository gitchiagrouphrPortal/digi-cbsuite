import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/programmes/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Audit — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={audits}
        moduleKey="audits"
        routeBase="/app/audits/programmes"
        recordId={id}
      />
    );
  },
});
