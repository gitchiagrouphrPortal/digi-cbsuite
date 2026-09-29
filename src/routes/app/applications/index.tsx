import { createFileRoute } from "@tanstack/react-router";
import { RecordListView } from "@/components/record-list";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/")({
  head: () => ({
    meta: [
      { title: "All Applications — DigiCB" },
      {
        name: "description",
        content:
          "Certification application register across all frameworks with status workflow and audit history.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <RecordListView
      def={applications}
      moduleKey="applications"
      routeBase="/app/applications"
      description="Certification applications across all four accreditation frameworks."
    />
  );
}
