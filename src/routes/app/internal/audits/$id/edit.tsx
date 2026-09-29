import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { internalAudits } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/audits/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Internal Audit — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={internalAudits}
        moduleKey="internal"
        routeBase="/app/internal/audits"
        recordId={id}
      />
    );
  },
});
