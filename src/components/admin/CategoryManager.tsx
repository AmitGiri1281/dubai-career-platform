"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Tags } from "lucide-react";
import PageHeader from "./PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { jobs: number };
}

export default function CategoryManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "" });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      toast.success(editing ? "Category updated" : "Category created");
      setModalOpen(false);
      load();
    } catch (e: any) {
      toast.error(typeof e.message === "string" ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      toast.success("Category deleted");
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(typeof e.message === "string" ? e.message : "Delete failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group jobs into meaningful categories."
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New category
          </button>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories to organize your jobs."
          action={
            <button onClick={openCreate} className="btn-primary">
              Create category
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Jobs</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-medium">{c.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
                      {c.slug}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="muted">{c._count?.jobs ?? 0}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-md p-2 hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit category" : "New category"}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              placeholder="e.g., Technology"
              className="input-base"
              onKeyDown={(e) => e.key === "Enter" && save()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        message={`This will permanently delete "${deleteTarget?.name}". Jobs assigned to this category must be reassigned first.`}
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}