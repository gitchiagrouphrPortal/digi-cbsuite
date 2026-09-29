import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { feedback } from "@/lib/records-collections";
export const Route = createFileRoute("/app/crm/feedback/$id")({
  head: () => ({ meta: [{ title: "Feedback — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={feedback}
        moduleKey="crm"
        routeBase="/app/crm/feedback"
        recordId={id}
      />
    );
  },
});
