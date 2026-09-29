// DigiCB record detail view (tabs: overview, documents, comments, history + extra).
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  getRecordFn,
  changeStatusFn,
  addCommentFn,
  addAttachmentFn,
  getCollectionDefsFn,
} from "@/lib/records.functions";
import type { CollectionDef, RecordDTO } from "@/lib/records-schema";
import { AppPageHeader, Card, EmptyState, SectionTitle } from "@/components/app-primitives";
import { StatusBadge } from "@/components/status-badges";
import { useAuth } from "@/lib/auth-context";
import { roleHas } from "@/lib/digicb-roles";
import { toast } from "sonner";
import { ArrowLeft, Pencil, History, Paperclip, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { displayValue, Meta, type RefMap } from "@/components/record-fields";
import { ConformityReferencesTab } from "@/components/conformity-references-tab";
import { RichTextEditor } from "@/components/richtext-editor";

function ConformitySafeContent({
  value,
  recordNumber,
  title,
}: {
  value: string;
  recordNumber: string;
  title: string;
}) {
  if (!value || value.trim() === "") {
    return <p className="text-sm text-muted-foreground">No content yet.</p>;
  }
  return (
    <RichTextEditor
      value={value}
      onChange={() => {}}
      readOnly
      recordNumber={recordNumber}
      title={title}
    />
  );
}

export function RecordDetailView({
  def,
  moduleKey,
  routeBase,
  recordId,
  extraTabs,
}: {
  def: CollectionDef;
  moduleKey: string;
  routeBase: string;
  recordId: string;
  extraTabs?: { key: string; label: string; render: (r: RecordDTO) => ReactNode }[];
}) {
  const { user } = useAuth();
  const perms = user?.permissions ?? [];
  const canEdit = roleHas(moduleKey, perms);
  const navigate = useNavigate();
  const get = useServerFn(getRecordFn);
  const setStatus = useServerFn(changeStatusFn);
  const addCmt = useServerFn(addCommentFn);
  const addAtt = useServerFn(addAttachmentFn);
  const getDefs = useServerFn(getCollectionDefsFn);
  const [record, setRecord] = useState<RecordDTO | null>(null);
  const [refs, setRefs] = useState<RefMap>({});
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const r = await get({ data: { collection: def.key, id: recordId } });
    setRecord(r);
    if (r) {
      const defs = await getDefs({ data: { collections: [def.key] } }).catch(() => ({
        defs: {},
        refs: {} as RefMap,
      }));
      if (defs.refs) setRefs(defs.refs as RefMap);
    }
    setLoading(false);
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [recordId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!record)
    return (
      <EmptyState
        title={`${def.singular} not found`}
        body="This record may have been archived or deleted."
        action={
          <Link to={routeBase} className="text-sm font-medium text-primary hover:underline">
            Back to {def.label}
          </Link>
        }
      />
    );

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "conformity", label: "Conformity References" },
    { key: "documents", label: "Documents" },
    { key: "comments", label: `Comments (${record.comments.length})` },
    { key: "history", label: "Activity History" },
    ...(extraTabs ?? []),
  ];

  const changeStatus = async (status: string) => {
    if (!reason && status !== record.status) {
      toast.error("Please enter a reason for the status change.");
      return;
    }
    setBusy(true);
    try {
      const res = await setStatus({ data: { collection: def.key, id: record.id, status, reason } });
      if (res.ok) {
        toast.success(`Status changed to ${status}`);
        setRecord(res.record);
        setReason("");
      }
    } catch {
      toast.error("Status change failed");
    } finally {
      setBusy(false);
    }
  };
  const submitComment = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    try {
      const res = await addCmt({ data: { collection: def.key, id: record.id, body: comment } });
      if (res.ok) {
        setRecord(res.record);
        setComment("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Comment failed");
    } finally {
      setBusy(false);
    }
  };
  const uploadFile = async (file: File) => {
    setBusy(true);
    try {
      const res = await addAtt({
        data: {
          collection: def.key,
          id: record.id,
          name: file.name,
          size: file.size,
          kind: file.type || "file",
        },
      });
      if (res.ok) {
        setRecord(res.record);
        toast.success(`Uploaded ${file.name}`);
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: routeBase })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {def.label}
        </button>
        {canEdit && (
          <Link
            to={`${routeBase}/${record.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
      </div>
      <AppPageHeader
        title={record.number}
        description={String(record.data.title ?? record.data.organizationName ?? def.singular)}
      >
        <StatusBadge
          status={record.status}
          label={def.statuses.find((s) => s.value === record.status)?.label}
        />
      </AppPageHeader>

      <Card className="mb-6">
        <SectionTitle className="text-sm">Status workflow</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {def.statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => changeStatus(s.value)}
              disabled={busy || s.value === record.status}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                s.value === record.status
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for status change (required)…"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <Card>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Meta label="Record number" value={record.number} />
            <Meta
              label="Status"
              value={def.statuses.find((s) => s.value === record.status)?.label ?? record.status}
            />
            <Meta label="Owner" value={record.owner ?? "—"} />
            <Meta label="Branch" value={record.branchId ?? "—"} />
            <Meta
              label="Created by"
              value={`${record.createdBy} · ${new Date(record.createdAt).toLocaleString()}`}
            />
            <Meta
              label="Updated by"
              value={`${record.updatedBy} · ${new Date(record.updatedAt).toLocaleString()}`}
            />
            {def.fields.map((f) =>
              f.key === "content" ? (
                <div key={f.key} className="sm:col-span-2">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </p>
                  <ConformitySafeContent
                    value={String(record.data[f.key] ?? "")}
                    recordNumber={record.number}
                    title={String(record.data.title ?? def.singular)}
                  />
                </div>
              ) : (
                <Meta
                  key={f.key}
                  label={f.label}
                  value={displayValue(f, record.data[f.key], refs)}
                  full={f.type === "textarea"}
                />
              ),
            )}
          </div>
        </Card>
      )}

      {tab === "conformity" && <ConformityReferencesTab record={record} collectionKey={def.key} />}

      {tab === "documents" && (
        <Card>
          <SectionTitle>Documents & attachments</SectionTitle>
          <div className="mt-4">
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground hover:bg-accent">
              <Paperclip className="h-4 w-4" /> Upload file
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="mt-4 space-y-2">
            {record.attachments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            ) : (
              record.attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(a.size / 1024).toFixed(1)} KB · {a.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.ts).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {tab === "comments" && (
        <Card>
          <SectionTitle>Comments</SectionTitle>
          <div className="mt-4 space-y-3">
            {record.comments.length === 0 && (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
            {record.comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <p className="text-sm text-foreground">{c.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.author} · {new Date(c.ts).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="min-h-[60px] flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={submitComment}
              disabled={busy || !comment.trim()}
              className="inline-flex h-10 items-center gap-1.5 self-end rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> Add
            </button>
          </div>
        </Card>
      )}

      {tab === "history" && (
        <Card>
          <SectionTitle>Activity history (audit trail — read only)</SectionTitle>
          <div className="mt-4 space-y-2">
            {record.history.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <History className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{h.actor}</span> · {h.action}
                    {h.field && <span className="text-muted-foreground"> — {h.field}</span>}
                  </p>
                  {h.prev && h.next && (
                    <p className="text-xs text-muted-foreground">
                      <span className="line-through">{h.prev}</span> →{" "}
                      <span className="font-medium text-foreground">{h.next}</span>
                    </p>
                  )}
                  {h.reason && <p className="text-xs text-muted-foreground">Reason: {h.reason}</p>}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {new Date(h.ts).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {extraTabs?.map((t) => (tab === t.key ? <div key={t.key}>{t.render(record)}</div> : null))}
    </div>
  );
}
