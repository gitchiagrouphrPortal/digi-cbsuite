import { createFileRoute } from "@tanstack/react-router";
import { FrameworkWorkspace } from "./17021";

export const Route = createFileRoute("/app/frameworks/17024")({
  head: () => ({ meta: [{ title: "ISO/IEC 17024 Workspace — DigiCB" }] }),
  component: () => (
    <FrameworkWorkspace fwId="fw_17024" code="ISO/IEC 17024" title="Certification of Persons" />
  ),
});
