import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/app/certificates/$id")({
  component: () => <Outlet />,
});
