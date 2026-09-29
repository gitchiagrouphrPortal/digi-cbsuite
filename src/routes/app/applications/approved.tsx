import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/approved")({
  head: () => ({ meta: [{ title: "Approved Applications — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <RecordListView
      def={applications}
      moduleKey="applications"
      routeBase="/app/applications"
      description="Approved certification applications — ready to convert into projects."
      fixedFilter={{ statusIn: ["approved", "converted"] }}
    />
  );
}
