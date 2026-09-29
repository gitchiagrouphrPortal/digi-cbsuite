import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { appeals } from "@/lib/records-collections-ext";

export const Route = createFileRoute("/app/complaints/appeals/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Appeal — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={appeals}
        moduleKey="complaints"
        routeBase="/app/complaints/appeals"
        recordId={id}
      />
    );
  },
});
