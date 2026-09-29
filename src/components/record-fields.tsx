// DigiCB record field input + shared helpers. Used by form/detail/kanban.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FieldSchema } from "@/lib/records-schema";
import { RichTextEditor } from "@/components/richtext-editor";

export type RefMap = Record<string, { id: string; number: string; label: string }[]>;

export function displayValue(field: FieldSchema, value: unknown, refs?: RefMap): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "select") {
    const opt = field.options?.find((o) => o.value === value);
    return opt?.label ?? String(value);
  }
  if (field.type === "checkbox") return value ? "Yes" : "No";
  if (field.type === "ref" && refs && field.refCollection) {
    const list = refs[field.refCollection];
    const found = list?.find((r) => r.id === value || r.number === value);
    return found?.label ?? String(value);
  }
  return String(value);
}

export function Meta({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{value}</p>
    </div>
  );
}

export function FieldInput({
  field,
  value,
  refs,
  error,
  onChange,
  readOnly,
}: {
  field: FieldSchema;
  value: unknown;
  refs: RefMap;
  error?: string;
  onChange: (v: unknown) => void;
  readOnly?: boolean;
}) {
  const base =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";
  const invalid = error ? "border-destructive" : "";
  const label = (
    <label className="mb-1 block text-xs font-semibold text-foreground">
      {field.label}
      {field.required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  );
  let control: ReactNode;
  switch (field.type) {
    case "textarea":
      if (field.key === "content") {
        return (
          <div className="sm:col-span-2">
            {label}
            <div className="mt-1">
              <RichTextEditor
                value={String(value ?? "")}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={field.placeholder ?? "Enter document content…"}
              />
            </div>
            {field.help && <p className="mt-1 text-[11px] text-muted-foreground">{field.help}</p>}
            {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
          </div>
        );
      }
      control = (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          className={cn("min-h-[72px]", base, invalid)}
        />
      );
      break;
    case "select":
      control = (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={cn(base, invalid)}
        >
          <option value="">— Select —</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "checkbox":
      control = (
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            disabled={readOnly}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span>{field.help ?? "Yes"}</span>
        </label>
      );
      break;
    case "ref":
      control = (
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={cn(base, invalid)}
        >
          <option value="">— Select {field.refCollection} —</option>
          {refs[field.refCollection ?? ""]?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label} ({r.number})
            </option>
          ))}
        </select>
      );
      break;
    case "number":
      control = (
        <input
          type="number"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={field.placeholder}
          disabled={readOnly}
          className={cn(base, invalid)}
        />
      );
      break;
    case "date":
      control = (
        <input
          type="date"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={readOnly}
          className={cn(base, invalid)}
        />
      );
      break;
    case "email":
      control = (
        <input
          type="email"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          className={cn(base, invalid)}
        />
      );
      break;
    case "tel":
      control = (
        <input
          type="tel"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          className={cn(base, invalid)}
        />
      );
      break;
    default:
      control = (
        <input
          type="text"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          disabled={readOnly}
          className={cn(base, invalid)}
        />
      );
  }
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      {field.type !== "checkbox" && label}
      {control}
      {field.help && field.type !== "checkbox" && (
        <p className="mt-1 text-[11px] text-muted-foreground">{field.help}</p>
      )}
      {error && <p className="mt-1 text-[11px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function groupFields(def: {
  key: string;
  label: string;
  fields: FieldSchema[];
}): { title: string; fields: FieldSchema[] }[] {
  if (def.key === "applications") {
    const keys = (ks: string[]) => def.fields.filter((f) => ks.includes(f.key));
    return [
      {
        title: "Basic Information",
        fields: keys([
          "applicationDate",
          "applicationType",
          "serviceType",
          "framework",
          "standard",
          "scheme",
          "reviewer",
          "branchId",
        ]),
      },
      {
        title: "Client Information",
        fields: keys([
          "clientId",
          "organizationName",
          "tradingName",
          "registrationNo",
          "taxNumber",
          "website",
          "mainContact",
          "email",
          "phone",
          "address",
          "country",
          "city",
        ]),
      },
      {
        title: "Certification Information",
        fields: keys([
          "scope",
          "productsServices",
          "employees",
          "shifts",
          "sites",
          "outsourced",
          "existingCerts",
          "previousBody",
          "transfer",
          "integrated",
          "remote",
          "regulatory",
          "preferredDates",
          "language",
        ]),
      },
      {
        title: "Risk & Complexity",
        fields: keys([
          "technicalSector",
          "iafCode",
          "riskCategory",
          "complexity",
          "multiSite",
          "seasonal",
          "auditDuration",
          "specialCompetence",
        ]),
      },
      {
        title: "Declarations",
        fields: keys([
          "declarationAccepted",
          "confidentialityAccepted",
          "conflictInfo",
          "authorizedRep",
          "declarationDate",
        ]),
      },
    ];
  }
  return [{ title: def.label, fields: def.fields }];
}

export function exportCSV(
  def: {
    key: string;
    label: string;
    fields: FieldSchema[];
    statuses: { value: string; label: string }[];
  },
  records: { number: string; data: Record<string, unknown>; status: string; updatedAt: number }[],
) {
  const cols = def.fields.filter((f) => f.listCol);
  const header = ["Number", ...cols.map((c) => c.label), "Status", "Updated"];
  const rows = records.map((r) => [
    r.number,
    ...cols.map((c) => displayValue(c, r.data[c.key])),
    def.statuses.find((s) => s.value === r.status)?.label ?? r.status,
    new Date(r.updatedAt).toISOString(),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${def.key}-export.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
