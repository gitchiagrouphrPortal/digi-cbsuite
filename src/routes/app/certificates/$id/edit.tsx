import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { certificates } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/certificates/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Certificate — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={certificates}
        moduleKey="certificates"
        routeBase="/app/certificates"
        recordId={id}
      />
    );
  },
});
