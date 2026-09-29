import { createFileRoute } from "@tanstack/react-router";
import { FrameworkWorkspace } from "./17021";

export const Route = createFileRoute("/app/frameworks/ps4992")({
  head: () => ({ meta: [{ title: "PS 4992 Halal Workspace — DigiCB" }] }),
  component: () => (
    <FrameworkWorkspace fwId="fw_ps4992" code="PS 4992" title="Halal Certification Framework" />
  ),
});
