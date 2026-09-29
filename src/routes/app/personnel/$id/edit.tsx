import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { personnel } from "@/lib/records-collections-ext";
export const Route = createFileRoute("/app/personnel/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Personnel — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordFormView
        def={personnel}
        moduleKey="personnel"
        routeBase="/app/personnel"
        recordId={id}
      />
    );
  },
});
