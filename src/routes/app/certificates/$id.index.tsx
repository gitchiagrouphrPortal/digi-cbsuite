import { createFileRoute } from "@tanstack/react-router";
import { RecordDetailView } from "@/components/record-detail";
import { certificates } from "@/lib/records-collections-ext";
import { CertificationTimelineTab } from "@/components/certification-timeline-tab";
export const Route = createFileRoute("/app/certificates/$id/")({
  head: () => ({ meta: [{ title: "Certificate — DigiCB" }] }),
  component: () => {
    const { id } = Route.useParams();
    return (
      <RecordDetailView
        def={certificates}
        moduleKey="certificates"
        routeBase="/app/certificates"
        recordId={id}
        extraTabs={[
          {
            key: "timeline",
            label: "Lifecycle Timeline",
            render: (r) => <CertificationTimelineTab record={r} />,
          },
        ]}
      />
    );
  },
});
