import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/2fa")({
  head: () => ({ meta: [{ title: "Two-Factor Authentication — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Two-Factor Authentication"
        description="Mandatory 2FA for privileged accounts. Email codes, authenticator-app support, configurable SSO and recovery."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>2FA methods</SectionTitle>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Email authenticator code" status="Enabled" />
            <Row label="Authenticator app (TOTP)" status="Enabled" />
            <Row label="SMS fallback" status="Optional" />
            <Row label="Single sign-on (SAML/OIDC)" status="Configurable" />
            <Row label="Backup codes" status="Enabled" />
          </div>
        </Card>
        <Card>
          <SectionTitle>Enforcement policy</SectionTitle>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Privileged roles" status="Mandatory" />
            <Row label="All personnel" status="Recommended" />
            <Row label="Client users" status="Optional" />
            <Row label="Accreditation assessors" status="Mandatory" />
            <Row label="Code validity" status="5 min / 3 attempts" />
            <Row label="Recovery" status="Verified identity reset" />
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <SectionTitle>Enforcement status</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="success">Super admin: enforced</Pill>
          <Pill tone="success">Certification manager: enforced</Pill>
          <Pill tone="success">Decision-maker: enforced</Pill>
          <Pill tone="warning">Auditor: recommended</Pill>
          <Pill tone="muted">Client user: optional</Pill>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, status }: { label: string; status: string }) {
  const tone =
    status === "Mandatory" || status === "Enabled"
      ? "success"
      : status === "Optional" || status === "Configurable" || status === "Recommended"
        ? "warning"
        : "muted";
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <Pill tone={tone as "success" | "warning" | "muted"}>{status}</Pill>
    </div>
  );
}
