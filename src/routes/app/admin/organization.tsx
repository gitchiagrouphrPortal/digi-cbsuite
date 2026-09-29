import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getOrgFn, updateOrgFn, getBranchesFn } from "@/lib/digicb.functions";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { AppPageHeader, Card, DataTable, SectionTitle, Pill } from "@/components/app-primitives";
import type { Organization } from "@/lib/digicb-types";

export const Route = createFileRoute("/app/admin/organization")({
  head: () => ({ meta: [{ title: "Organization Profile — DigiCB" }] }),
  component: OrgPage,
});

function OrgPage() {
  const { user } = useAuth();
  const getOrg = useServerFn(getOrgFn);
  const updateOrg = useServerFn(updateOrgFn);
  const getBranches = useServerFn(getBranchesFn);
  const [org, setOrg] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Awaited<ReturnType<typeof getBranches>>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getOrg()
      .then((o) => active && setOrg(o))
      .catch(() => {});
    getBranches()
      .then((b) => active && setBranches(b))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [getOrg, getBranches]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    try {
      const updated = await updateOrg({ data: org });
      setOrg(updated);
      toast.success("Organization updated");
    } catch {
      toast.error("Could not save");
    }
    setSaving(false);
  };

  return (
    <div>
      <AppPageHeader
        title="Organization Profile"
        description="Head-office identity, legal details and branding. Updates are audit-logged."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Identity</SectionTitle>
          {org ? (
            <form onSubmit={save} className="mt-4 space-y-3">
              {(
                [
                  ["Trading name", "name"],
                  ["Legal name", "legalName"],
                  ["Tax / registration ID", "taxId"],
                  ["Website", "website"],
                  ["Email", "email"],
                  ["Phone", "phone"],
                  ["Address", "address"],
                ] as const
              ).map(([label, key]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-xs font-semibold text-foreground">{label}</span>
                  <input
                    value={(org as Record<string, string>)[key] ?? ""}
                    onChange={(e) => setOrg({ ...org, [key]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              ))}
              <button
                disabled={saving}
                className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {saving ? "Saving…" : "Save organization"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </Card>

        <Card>
          <SectionTitle>Branch offices</SectionTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {branches.length} branches registered.
          </p>
          <div className="mt-4">
            <DataTable
              headers={["Branch", "Type", "Location", "Status"]}
              rows={branches.map((b) => [
                <span className="font-medium text-foreground">{b.name}</span>,
                <span className="text-muted-foreground capitalize">
                  {b.type.replace("_", " ")}
                </span>,
                <span className="text-muted-foreground">
                  {b.city}, {b.country}
                </span>,
                <Pill tone={b.status === "active" ? "success" : "muted"}>{b.status}</Pill>,
              ])}
            />
          </div>
        </Card>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Acting as {user?.email}.</p>
    </div>
  );
}
