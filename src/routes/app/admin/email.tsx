import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/email")({
  head: () => ({ meta: [{ title: "Email Configuration — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Email Configuration"
        description="Domain email, SMTP or approved email-provider integration. Credentials are never exposed to ordinary users."
      />
      <Card>
        <SectionTitle>SMTP / provider settings</SectionTitle>
        <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">From name</span>
              <input
                defaultValue="DigiCB Notifications"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">From email</span>
              <input
                type="email"
                defaultValue="noreply@digicb.test"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">SMTP host</span>
              <input
                defaultValue=""
                placeholder="smtp.example.com"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-foreground">SMTP port</span>
              <input
                defaultValue=""
                placeholder="587"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="warning">Credentials secured</Pill>
            <span className="text-xs text-muted-foreground">
              SMTP username/password are stored as server secrets and never exposed in the client.
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Email provider integration is configured at the platform level. Contact your system
            administrator to enable SMTP delivery.
          </p>
        </form>
      </Card>
    </div>
  );
}
