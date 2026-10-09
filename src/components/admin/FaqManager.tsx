"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  HelpCircle,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import PageHeader from "./PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  isActive: boolean;
}

const emptyForm = {
  question: "",
  answer: "",
  category: "",
  order: 0,
  isActive: true,
};

export default function FaqManager() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs?all=true");
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length });
    setModalOpen(true);
  };

  const openEdit = (f: FAQ) => {
    setEditing(f);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category ?? "",
      order: f.order,
      isActive: f.isActive,
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/faqs/${editing.id}` : "/api/faqs";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Updated" : "Created");
      setModalOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/faqs/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("Deleted");
    setDeleteTarget(null);
    load();
  };

  const toggleActive = async (f: FAQ) => {
    await fetch(`/api/faqs/${f.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !f.isActive }),
    });
    load();
  };

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Frequently asked questions shown to visitors."
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New FAQ
          </button>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No FAQs yet"
          description="Add answers to common questions."
          action={
            <button onClick={openCreate} className="btn-primary">
              Add FAQ
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="card-base flex gap-4">
              <GripVertical className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{f.question}</h3>
                  {f.category && <Badge variant="info">{f.category}</Badge>}
                  <Badge variant={f.isActive ? "success" : "muted"}>
                    {f.isActive ? "Active" : "Hidden"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    #{f.order}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {f.answer}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => toggleActive(f)}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  {f.isActive ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(f)}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(f)}
                  className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit FAQ" : "New FAQ"}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Question</label>
            <input
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Answer</label>
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              rows={5}
              className="input-base min-h-[120px] py-2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Category
              </label>
              <input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="input-base"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
                className="input-base"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
                className="h-4 w-4 rounded border-border"
              />
              <span>Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete FAQ?"
        message="This action cannot be undone."
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}