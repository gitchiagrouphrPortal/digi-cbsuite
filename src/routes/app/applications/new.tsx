import { createFileRoute } from "@tanstack/react-router";
import { RecordFormView } from "@/components/record-form";
import { applications } from "@/lib/records-collections";

export const Route = createFileRoute("/app/applications/new")({
  head: () => ({
    meta: [
      { title: "New Application — DigiCB" },
      { name: "description", content: "Create a new certification application." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <RecordFormView def={applications} moduleKey="applications" routeBase="/app/applications" />
  );
}
