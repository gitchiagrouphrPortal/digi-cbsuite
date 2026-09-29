import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/security")({
  head: () => ({ meta: [{ title: "Security Settings — DigiCB" }] }),
  component: Page,
});

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Security Settings"
        description="Password policy, lockout, session timeout, IP restrictions, retention, data-retention and secure-deletion rules."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Authentication policy</SectionTitle>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Minimum password length" value="12 characters" />
            <Row label="Password complexity" value="Upper, lower, number, symbol" />
            <Row label="Password expiry" value="90 days" />
            <Row label="Failed login lockout" value="5 attempts / 15 min lockout" />
            <Row label="Session timeout" value="30 minutes idle" />
            <Row label="Remember-me duration" value="14 days" />
            <Row label="IP restrictions" value="Optional, configurable per role" />
          </div>
        </Card>
        <Card>
          <SectionTitle>Data protection</SectionTitle>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Encryption in transit" value="TLS 1.2+" />
            <Row label="Encryption at rest" value="AES-256" />
            <Row label="Malware scanning" value="All uploads scanned" />
            <Row label="Audit-log retention" value="7 years" />
            <Row label="Record retention" value="Per scheme, configurable" />
            <Row label="Secure deletion" value="Crypto-shred on expiry" />
            <Row label="Backup frequency" value="Daily + tested restore" />
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <SectionTitle>Active protections</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="success">2FA enforced (privileged)</Pill>
          <Pill tone="success">Rate limiting</Pill>
          <Pill tone="success">CSRF protection</Pill>
          <Pill tone="success">XSS sanitization</Pill>
          <Pill tone="success">SQL injection prevention</Pill>
          <Pill tone="success">Suspicious-login alerts</Pill>
          <Pill tone="success">Permission-change alerts</Pill>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
