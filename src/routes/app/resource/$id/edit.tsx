import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { resourceGaps } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/resource/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Resource Gap — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={resourceGaps}
        moduleKey="resource"
        routeBase="/app/resource"
        recordId={id}
      />
    );
  },
});
