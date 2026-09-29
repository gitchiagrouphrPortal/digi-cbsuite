import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { personnel } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/personnel/$id/")({
  head: () => ({ meta: [{ title: "Person — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={personnel}
        moduleKey="personnel"
        routeBase="/app/personnel"
        recordId={id}
      />
    );
  },
});
