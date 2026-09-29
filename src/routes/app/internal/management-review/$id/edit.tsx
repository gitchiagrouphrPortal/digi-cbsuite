import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { mgmtReviews } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/internal/management-review/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Management Review — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={mgmtReviews}
        moduleKey="internal"
        routeBase="/app/internal/management-review"
        recordId={id}
      />
    );
  },
});
