import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { complaints } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Complaint — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={complaints}
        moduleKey="complaints"
        routeBase="/app/complaints"
        recordId={id}
      />
    );
  },
});
