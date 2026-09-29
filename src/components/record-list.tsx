// DigiCB record list view (searchable/filterable/paginated register).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { listRecordsFn, duplicateRecordFn, archiveRecordFn } from "@/lib/records.functions";
import type { CollectionDef, RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState } from "@/components/app-primitives";
import { ClauseReferenceBanner } from "@/components/clause-reference-banner";
import { StatusBadge } from "@/components/status-badges";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";
import { toast } from "sonner";
import { Plus, Search, Eye, Pencil, Copy, Archive, Download, X, Loader2 } from "lucide-react";
import { displayValue, exportCSV } from "@/components/record-fields";
import { useNavigate } from "@tanstack/react-router";

export interface RecordListViewProps {
  def: CollectionDef;
  extraColumns?: { key: string; header: string; render: (r: RecordDTO) => ReactNode }[];
  fixedFilter?: { status?: string; statusIn?: string[]; framework?: string; branchId?: string };
  moduleKey: string;
  routeBase: string;
  description?: string;
  showSummary?: boolean;
}

export function RecordListView({
  def,
  extraColumns = [],
  fixedFilter,
  moduleKey,
  routeBase,
  description,
  showSummary = true,
}: RecordListViewProps) {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canCreate = roleHas(moduleKey, perms);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("");
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const list = useServerFn(listRecordsFn);

  const fetchList = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const res = await list({
          data: {
            collection: def.key,
            search: search || undefined,
            status: statusFilter || undefined,
            framework: frameworkFilter || undefined,
            archived: false,
            ...fixedFilter,
          },
        });
        setRecords(res.records);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [def.key, search, statusFilter, frameworkFilter, fixedFilter, list],
  );
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const summary = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const s of def.statuses) groups[s.value] = 0;
    for (const r of records) groups[r.status] = (groups[r.status] ?? 0) + 1;
    return groups;
  }, [records, def.statuses]);

  const listCols = def.fields.filter((f) => f.listCol);
  const totalPages = Math.max(1, Math.ceil(records.length / perPage));
  const pageRecords = records.slice((page - 1) * perPage, page * perPage);
  const frameworkField = def.fields.find((f) => f.key === "framework" && f.type === "select");

  return (
    <div>
      <AppPageHeader
        title={def.label}
        description={
          description ??
          `Manage ${def.label.toLowerCase()} with persistence, status workflow and audit history.`
        }
      >
        {canCreate && (
          <Link
            to={`${routeBase}/new`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Create {def.singular}
          </Link>
        )}
        <button
          onClick={() => exportCSV(def, records)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </AppPageHeader>

      <ClauseReferenceBanner collectionKey={def.key} />

      {showSummary && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <Card className="p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="font-display text-xl font-bold text-foreground">{records.length}</p>
          </Card>
          {def.statuses.slice(0, 5).map((s) => (
            <Card key={s.value} className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {s.label}
              </p>
              <p className="font-display text-xl font-bold text-foreground">
                {summary[s.value] ?? 0}
              </p>
            </Card>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${def.label.toLowerCase()}…`}
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <FilterSelect
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          placeholder="All statuses"
          options={def.statuses.map((s) => ({ value: s.value, label: s.label }))}
        />
        {frameworkField && (
          <FilterSelect
            value={frameworkFilter}
            onChange={(v) => {
              setFrameworkFilter(v);
              setPage(1);
            }}
            placeholder="All frameworks"
            options={frameworkField.options ?? []}
          />
        )}
        {(search || statusFilter || frameworkFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setFrameworkFilter("");
            }}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-input bg-background px-3 text-sm text-foreground hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <Card className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </Card>
      ) : records.length === 0 ? (
        <EmptyState
          title={`No ${def.label.toLowerCase()} found`}
          body={
            canCreate
              ? `Create your first ${def.singular.toLowerCase()} to get started.`
              : "Adjust your filters to see records."
          }
          action={
            canCreate ? (
              <Link
                to={`${routeBase}/new`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Create {def.singular}
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    Number
                  </th>
                  {listCols.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-foreground"
                    >
                      {c.label}
                    </th>
                  ))}
                  {extraColumns.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap px-4 py-3 font-semibold text-foreground"
                    >
                      {c.header}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">
                    Updated
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageRecords.map((r) => (
                  <tr key={r.id} className="bg-card hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to={`${routeBase}/${r.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        {r.number}
                      </Link>
                      {r.demo && (
                        <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">
                          Demo
                        </span>
                      )}
                    </td>
                    {listCols.map((c) => (
                      <td key={c.key} className="max-w-[220px] truncate px-4 py-3 text-foreground">
                        {displayValue(c, r.data[c.key])}
                      </td>
                    ))}
                    {extraColumns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-foreground">
                        {c.render(r)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={r.status}
                        label={def.statuses.find((s) => s.value === r.status)?.label}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions record={r} routeBase={routeBase} def={def} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{records.length} records</span>
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 text-xs">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RowActions({
  record,
  routeBase,
  def,
}: {
  record: RecordDTO;
  routeBase: string;
  def: CollectionDef;
}) {
  const dup = useServerFn(duplicateRecordFn);
  const arch = useServerFn(archiveRecordFn);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const handleDup = async () => {
    setBusy(true);
    try {
      const res = await dup({ data: { collection: def.key, id: record.id } });
      if (res.ok && res.record) {
        toast.success(`Duplicated as ${res.record.number}`);
        navigate({ to: `${routeBase}/${res.record.id}` });
      }
    } catch {
      toast.error("Duplicate failed");
    } finally {
      setBusy(false);
    }
  };
  const handleArchive = async () => {
    setBusy(true);
    try {
      await arch({ data: { collection: def.key, id: record.id, archived: true } });
      toast.success("Archived");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      toast.error("Archive failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        to={`${routeBase}/${record.id}`}
        title="View"
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Eye className="h-3.5 w-3.5" />
      </Link>
      <Link
        to={`${routeBase}/${record.id}/edit`}
        title="Edit"
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <button
        onClick={handleDup}
        disabled={busy}
        title="Duplicate"
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleArchive}
        disabled={busy}
        title="Archive"
        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <Archive className="h-3.5 w-3.5" />
      </button>
      {busy && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
