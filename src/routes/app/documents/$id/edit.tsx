import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { documents } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/documents/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Document — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={documents}
        moduleKey="documents"
        routeBase="/app/documents"
        recordId={id}
      />
    );
  },
});
