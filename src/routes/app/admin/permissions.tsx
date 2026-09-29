import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRolesListFn } from "@/lib/digicb.functions";
import { AppPageHeader, Card, DataTable } from "@/components/app-primitives";
import { ROLE_PERMS } from "@/lib/digicb-roles";
import { PermCell } from "@/components/status-badges";

export const Route = createFileRoute("/app/admin/permissions")({
  head: () => ({ meta: [{ title: "Permission Matrix — DigiCB" }] }),
  component: Page,
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
  { key: "conformity", label: "Conformity" },
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

function Page() {
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
        title="Permission Matrix"
        description="Module-level access per role. Branch, scheme and field-level rules enforced by the SoD engine. Permissions: read, create, edit, approve, delete, export, administer."
      />
      <Card>
        <div className="overflow-x-auto">
          <DataTable
            headers={["Role", ...AREAS.map((a) => a.label)]}
            rows={roles.map((role) => [
              <span className="font-medium text-foreground">{role}</span>,
              ...AREAS.map((a) => <PermCell key={a.key} level={permLevel(role, a.key)} />),
            ])}
          />
        </div>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Permission changes are audit-logged. Configure detailed rules in{" "}
        <Link to="/app/admin/roles" className="text-primary hover:underline">
          Roles & Permissions
        </Link>
        .
      </p>
    </div>
  );
}
