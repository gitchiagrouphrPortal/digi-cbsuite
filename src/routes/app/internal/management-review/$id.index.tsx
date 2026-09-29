import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { mgmtReviews } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/management-review/$id/")({
  head: () => ({ meta: [{ title: "Management Review Record — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={mgmtReviews}
        moduleKey="internal"
        routeBase="/app/internal/management-review"
        recordId={id}
      />
    );
  },
});
