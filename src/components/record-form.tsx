// DigiCB record form view (create/edit with validation, save draft, submit).
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getRecordFn, saveRecordFn, getCollectionDefsFn } from "@/lib/records.functions";
import type { CollectionDef, RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, SectionTitle } from "@/components/app-primitives";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { FieldInput, groupFields, type RefMap } from "@/components/record-fields";

export function RecordFormView({
  def,
  moduleKey,
  routeBase,
  recordId,
}: {
  def: CollectionDef;
  moduleKey: string;
  routeBase: string;
  recordId?: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const perms = user?.permissions ?? [];
  const canEdit = roleHas(moduleKey, perms);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [record, setRecord] = useState<RecordDTO | null>(null);
  const [refs, setRefs] = useState<RefMap>({});
  const [loading, setLoading] = useState(!!recordId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const get = useServerFn(getRecordFn);
  const save = useServerFn(saveRecordFn);
  const getDefs = useServerFn(getCollectionDefsFn);

  useEffect(() => {
    let active = true;
    (async () => {
      const defs = await getDefs({ data: { collections: [def.key] } }).catch(() => ({
        defs: {},
        refs: {} as RefMap,
      }));
      if (active && defs.refs) setRefs(defs.refs as RefMap);
      if (recordId) {
        const r = await get({ data: { collection: def.key, id: recordId } });
        if (active && r) {
          setRecord(r);
          setValues(r.data);
        }
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [def.key, recordId, get, getDefs]);

  const isEdit = !!recordId && !!record;
  if (!canEdit && !isEdit) {
    return (
      <Card>
        <p className="text-sm text-destructive">
          You do not have permission to create {def.label.toLowerCase()}.
        </p>
        <Link
          to={routeBase}
          className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Back to {def.label}
        </Link>
      </Card>
    );
  }

  const setField = (key: string, v: unknown) => setValues((s) => ({ ...s, [key]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    for (const f of def.fields) {
      if (f.required) {
        const v = values[f.key];
        const empty =
          v === undefined || v === null || v === "" || (f.type === "checkbox" && v !== true);
        if (empty) e[f.key] = `${f.label} is required`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (status?: string) => {
    if (status && status !== "draft") {
      if (!validate()) {
        toast.error("Please complete required fields.");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await save({
        data: {
          collection: def.key,
          id: recordId,
          data: values,
          status: status ?? record?.status,
          framework: values.framework ? String(values.framework) : undefined,
          branchId: values.branchId ? String(values.branchId) : undefined,
        },
      });
      if (res.ok && res.record) {
        toast.success(
          isEdit ? `${def.singular} updated` : `${def.singular} saved as ${res.record.number}`,
        );
        navigate({ to: `${routeBase}/${res.record.id}` });
      } else {
        toast.error(res.error ?? "Save failed");
      }
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const sections = groupFields(def);

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate({ to: routeBase })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {def.label}
        </button>
      </div>
      <AppPageHeader
        title={isEdit ? `Edit ${def.singular}` : `New ${def.singular}`}
        description={isEdit ? record?.number : `Create a new ${def.singular.toLowerCase()} record.`}
      />
      <div className="space-y-6">
        {sections.map((sec) => (
          <Card key={sec.title}>
            <SectionTitle>{sec.title}</SectionTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {sec.fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={values[f.key]}
                  refs={refs}
                  error={errors[f.key]}
                  onChange={(v) => setField(f.key, v)}
                  readOnly={!canEdit}
                />
              ))}
            </div>
          </Card>
        ))}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={() => navigate({ to: routeBase })}
            className="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => submit("draft")}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Draft
          </button>
          <button
            onClick={() => submit(def.key === "applications" ? "submitted" : undefined)}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
            {isEdit ? "Save Changes" : def.key === "applications" ? "Submit Application" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
