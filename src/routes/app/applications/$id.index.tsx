import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/$id/")({
  head: () => ({ meta: [{ title: "Application — DigiCB" }] }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return (
    <RecordDetailView
      def={applications}
      moduleKey="applications"
      routeBase="/app/applications"
      recordId={id}
    />
  );
}
