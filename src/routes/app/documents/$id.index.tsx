import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/$id/")({
  head: () => ({ meta: [{ title: "Document — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={documents}
        moduleKey="documents"
        routeBase="/app/documents"
        recordId={id}
      />
    );
  },
});
