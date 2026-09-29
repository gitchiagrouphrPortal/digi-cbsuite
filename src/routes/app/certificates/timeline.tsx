import { createFileRoute } from "@tanstack/react-router";
import { CertificationTimelineView } from "@/components/certification-timeline";
export const Route = createFileRoute("/app/certificates/timeline")({
  head: () => ({
    meta: [
      { title: "Certification Lifecycle Timeline — DigiCB" },
      {
        name: "description",
        content:
          "End-to-end certification tracking flow for every certified client — application, audit, NCR, decision and issuance history.",
      },
    ],
  }),
  component: CertificationTimelineView,
});
