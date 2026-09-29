import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { internalAudits } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/audits/$id/")({
  head: () => ({ meta: [{ title: "Internal Audit Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={internalAudits}
        moduleKey="internal"
        routeBase="/app/internal/audits"
        recordId={id}
      />
    );
  },
});
