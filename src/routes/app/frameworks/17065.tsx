import { createFileRoute } from "@tanstack/react-router";
import { FrameworkWorkspace } from "./17021";

export const Route = createFileRoute("/app/frameworks/17065")({
  head: () => ({ meta: [{ title: "ISO/IEC 17065 Workspace — DigiCB" }] }),
  component: () => (
    <FrameworkWorkspace
      fwId="fw_17065"
      code="ISO/IEC 17065"
      title="Product, Process & Service Certification"
    />
  ),
});
