import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { audits } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/audits/programmes/$id/")({
  head: () => ({ meta: [{ title: "Audit — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={audits}
        moduleKey="audits"
        routeBase="/app/audits/programmes"
        recordId={id}
      />
    );
  },
});
