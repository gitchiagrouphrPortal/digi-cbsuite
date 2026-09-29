import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, Card, SectionTitle, Pill } from "@/components/app-primitives";

export const Route = createFileRoute("/app/admin/form-builder")({
  head: () => ({ meta: [{ title: "Form Builder — DigiCB" }] }),
  component: Page,
});

const FIELD_TYPES = [
  "Text",
  "Textarea",
  "Number",
  "Date",
  "Select",
  "Multi-select",
  "Checkbox",
  "Radio",
  "File upload",
  "Reference",
  "Section break",
];

function Page() {
  return (
    <div>
      <AppPageHeader
        title="Form Builder"
        description="Build configurable application, audit, NCR and custom forms with field types, validation, conditional logic and permissions."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <SectionTitle>Field palette</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">Drag field types onto the canvas.</p>
          <div className="mt-3 space-y-2">
            {FIELD_TYPES.map((f) => (
              <div
                key={f}
                className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
              >
                {f}
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <SectionTitle>Form canvas</SectionTitle>
          <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">Drop fields here to build your form.</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Each field supports: required flag, validation, conditional visibility, permissions
              and numbering.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Pill tone="info">Sections supported</Pill>
            <Pill tone="info">Conditional logic</Pill>
            <Pill tone="info">Field-level permissions</Pill>
          </div>
        </Card>
      </div>
    </div>
  );
}
