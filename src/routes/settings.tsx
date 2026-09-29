import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, SectionCard, ExportBar } from "@/components/page-primitives";
import {
  Tags,
  Boxes,
  Type,
  Mail,
  PanelTop,
  FileDown,
  Bold,
  Italic,
  Link2,
  List,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings & Builder — DigiCB" },
      {
        name: "description",
        content:
          "DigiCB settings: custom fields, custom objects, tags, email-template builder, universal document header/footer and Word/Excel/PDF export.",
      },
      { property: "og:title", content: "Settings & Builder — DigiCB" },
      {
        property: "og:description",
        content:
          "Custom fields, objects, tags, email builder, document header/footer and export formats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsRoute,
});

const CUSTOM_FIELDS = [
  { name: "Halal Certification Type", type: "Dropdown", object: "Client", required: true },
  { name: "IAF Code", type: "Text", object: "Application", required: true },
  { name: "Audit Language", type: "Multi-select", object: "Audit", required: false },
  { name: "Risk Category", type: "Dropdown", object: "Application", required: true },
  { name: "Accreditation Body", type: "Reference", object: "Project", required: true },
];

const CUSTOM_OBJECTS = [
  { name: "Halal Product", desc: "Product records for PS 4992 certifications", tag: "ps4992" },
  { name: "Personnel Category", desc: "ISO/IEC 17024 certification categories", tag: "17024" },
  { name: "Witness Evaluation", desc: "Auditor performance witness records", tag: "global" },
  { name: "Impartiality Declaration", desc: "Conflict-of-interest declarations", tag: "global" },
];

const TAGS = [
  "ISO-9001",
  "ISO-14001",
  "ISO-45001",
  "Halal-Food",
  "Halal-Cosmetics",
  "AI-MS",
  "Multi-site",
  "High-risk",
  "Surveillance",
  "Recertification",
  "Stage-1",
  "Stage-2",
];

function SettingsRoute() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Deliverable 07"
        title="Settings & Builder"
        description="Fully configurable: custom fields, custom objects, tags, a visual email-template builder, a universal document header/footer region, and Word/Excel/PDF export with pagination."
      >
        <ExportBar />
      </PageHeader>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Custom fields" className="lg:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Type className="h-4 w-4 text-primary" /> Add, reorder and validate fields per object
              — all configurable without code.
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-foreground">Field name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Object</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {CUSTOM_FIELDS.map((f) => (
                    <tr key={f.name} className="bg-card">
                      <td className="px-4 py-3 font-medium text-foreground">{f.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.object}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${f.required ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {f.required ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Tags">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tags className="h-4 w-4 text-primary" /> Apply across records for filtering and saved
              views.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          title="Custom objects"
          description="Configurable record types per framework — define fields, layouts and workflows."
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Boxes className="h-4 w-4 text-primary" /> Objects inherit tenancy, numbering formats
            and approval rules.
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CUSTOM_OBJECTS.map((o) => (
              <div key={o.name} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{o.name}</p>
                  <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {o.tag}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{o.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Email-template builder"
          description="A drag-and-drop builder with merge fields, per-situation templates and configurable SMTP — credentials never exposed to ordinary users."
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" /> Templates for every situation: application
            received, NCR issued, certificate issued, surveillance due, complaint acknowledged,
            transition deadline, and more.
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <div className="flex gap-1">
                  <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent">
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">Subject</span>
                <input
                  className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm"
                  defaultValue="Your application {{application.id}} has been approved"
                  readOnly
                />
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <p>{"Dear {{client.contact_name}},"}</p>
                <p>
                  We are pleased to confirm that your application for{" "}
                  <strong>{"{{scheme.name}}"}</strong> certification has been approved. Your
                  certification project has been created.
                </p>
                <p>
                  Next step: audit programme scheduling. Your certification manager will be in touch
                  shortly.
                </p>
                <p className="text-muted-foreground">— {"{{organization.name}}"} via DigiCB</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Merge fields
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "{{client.name}}",
                  "{{client.contact_name}}",
                  "{{application.id}}",
                  "{{scheme.name}}",
                  "{{cert_number}}",
                  "{{expiry_date}}",
                  "{{organization.name}}",
                  "{{dashboard_url}}",
                ].map((m) => (
                  <span
                    key={m}
                    className="rounded border border-border bg-card px-2 py-1 font-mono text-[11px] text-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SMTP
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Domain email & provider integration configurable in Settings. Credentials are
                  masked and restricted to administrators.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Universal document header / footer"
            description="A single region applied to every exported document across the system."
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PanelTop className="h-4 w-4 text-primary" /> Define once, used everywhere — Word,
              Excel and PDF.
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Header region
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-foreground">
                    DigiCB · {"{{organization.name}}"}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {"{{doc.code}}"} · Rev {"{{doc.revision}}"}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Footer region
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Confidentiality: {"{{doc.classification}}"} · Page {"{{page}}"} of {"{{pages}}"}
                  </span>
                  <span>
                    Generated {"{{date}}"} · {"{{user}}"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Export & pagination"
            description="All documents downloadable in MS Word, Excel or PDF; all long pages paginate."
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileDown className="h-4 w-4 text-primary" /> Export is role-gated and audit-logged.
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Word", "Excel", "PDF"].map((f) => (
                <div key={f} className="rounded-lg border border-border bg-card p-4 text-center">
                  <p className="font-display text-sm font-semibold text-foreground">{f}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Header/footer + pagination</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Pagination applies to every long document and report; page size and margins follow the
              header/footer region defined above.
            </p>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}
