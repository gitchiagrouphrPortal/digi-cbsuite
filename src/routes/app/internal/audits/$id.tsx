import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/internal/audits/$id")({
  component: () => <Outlet />,
});
