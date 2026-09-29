import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Application — DigiCB" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return (
    <RecordFormView
      def={applications}
      moduleKey="applications"
      routeBase="/app/applications"
      recordId={id}
    />
  );
}
