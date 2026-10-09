"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Inbox,
  Mail,
  Phone,
  Trash2,
  Mail as MailIcon,
} from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: "NEW" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
}

const statusVariant = {
  NEW: "info",
  IN_PROGRESS: "warning",
  CLOSED: "success",
} as const;

const FILTERS = ["ALL", "NEW", "IN_PROGRESS", "CLOSED"] as const;

export default function InquiryManager() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries?status=${filter}`);
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const updateStatus = async (id: string, status: Inquiry["status"]) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Status updated");
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/inquiries/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("Deleted");
    setDeleteTarget(null);
    setSelected(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Messages from the contact form."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card hover:bg-accent"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries"
          description={
            filter !== "ALL"
              ? `No ${filter.toLowerCase()} inquiries.`
              : "You haven't received any inquiries yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <button
              key={i.id}
              onClick={() => setSelected(i)}
              className="card-base block w-full text-left transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{i.name}</span>
                    <Badge variant={statusVariant[i.status]}>
                      {i.status.replace("_", " ")}
                    </Badge>
                    {i.service && (
                      <Badge variant="muted">{i.service}</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {i.email}
                    </span>
                    {i.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {i.phone}
                      </span>
                    )}
                    <span>{formatDate(i.createdAt)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {i.message}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.email}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={statusVariant[selected.status]}>
                {selected.status.replace("_", " ")}
              </Badge>
              {selected.service && (
                <Badge variant="muted">Service: {selected.service}</Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDate(selected.createdAt)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`mailto:${selected.email}`}
                className="btn-outline justify-start"
              >
                <MailIcon className="mr-2 h-4 w-4" />
                {selected.email}
              </a>
              {selected.phone && (
                <a
                  href={`tel:${selected.phone}`}
                  className="btn-outline justify-start"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {selected.phone}
                </a>
              )}
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4">
              <p className="whitespace-pre-line text-sm">{selected.message}</p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Update status
              </p>
              <div className="flex flex-wrap gap-2">
                {(["NEW", "IN_PROGRESS", "CLOSED"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={selected.status === s}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      selected.status === s
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-card hover:bg-accent"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between border-t border-border pt-4">
              <button
                onClick={() => setDeleteTarget(selected)}
                className="inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
              >
                <Trash2 className="h-4 w-4" /> Delete inquiry
              </button>
              <button
                onClick={() => setSelected(null)}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete inquiry?"
        message="This will permanently remove the message."
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}