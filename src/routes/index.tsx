import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionFn } from "@/lib/digicb.functions";

export const Route = createFileRoute("/")({
  // Login must be the start page. Authenticated users go to the dashboard.
  beforeLoad: async () => {
    const res = await getSessionFn();
    if (res.user) throw redirect({ to: "/app/dashboard" });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
