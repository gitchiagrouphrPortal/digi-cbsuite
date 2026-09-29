import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRolesListFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, DataTable } from "@/components/app-primitives";
import { ROLE_PERMS } from "@/lib/digicb-roles";
import { PermCell } from "@/components/status-badges";

export const Route = createFileRoute("/app/admin/roles")({
  head: () => ({ meta: [{ title: "Roles & Permissions — DigiCB" }] }),
  component: RolesPage,
});

const AREAS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "crm", label: "CRM" },
  { key: "applications", label: "Apps" },
  { key: "projects", label: "Projects" },
  { key: "audits", label: "Audits" },
  { key: "ncr", label: "NCR" },
  { key: "decisions", label: "Decisions" },
  { key: "certificates", label: "Certs" },
  { key: "documents", label: "Docs" },
  { key: "frameworks", label: "Frameworks" },
  { key: "personnel", label: "Personnel" },
  { key: "internal", label: "Internal" },
  { key: "complaints", label: "Complaints" },
  { key: "branches", label: "Branches" },
  { key: "kpis", label: "KPIs" },
  { key: "resource", label: "Resource" },
  { key: "training", label: "Training" },
  { key: "reports", label: "Reports" },
  { key: "admin", label: "Admin" },
];

function permLevel(role: string, key: string): "full" | "branch" | "read" | "none" {
  const list = ROLE_PERMS[role];
  if (!list) return "none";
  if (list.includes("*")) return "full";
  if (list.includes(key)) return "full";
  return "none";
}

function RolesPage() {
  const getRoles = useServerFn(getRolesListFn);
  const [roles, setRoles] = useState<string[]>([]);
  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => {});
  }, [getRoles]);

  return (
    <div>
      <AppPageHeader
        title="Roles & Permissions"
        description="Configurable RBAC + ABAC. Module access per role; branch, scheme and field-level rules enforced by the SoD engine."
      >
        <Link
          to="/app/admin/permissions"
          className="inline-flex h-9 items-center rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground hover:bg-accent"
        >
          Permission matrix
        </Link>
      </AppPageHeader>
      <Card>
        <DataTable
          headers={["Role", ...AREAS.map((a) => a.label)]}
          rows={roles.map((r) => [
            <span className="whitespace-nowrap font-medium text-foreground">{r}</span>,
            ...AREAS.map((a) => (
              <div className="text-center">
                <PermCell level={permLevel(r, a.key)} />
              </div>
            )),
          ])}
        />
      </Card>
    </div>
  );
}
