"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";
import PageHeader from "./PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
  imageUrl: string | null;
  rating: number;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  role: "",
  message: "",
  imageUrl: "",
  rating: 5,
  isActive: true,
};

export default function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials?all=true");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      role: t.role,
      message: t.message,
      imageUrl: t.imageUrl ?? "",
      rating: t.rating,
      isActive: t.isActive,
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing
        ? `/api/testimonials/${editing.id}`
        : "/api/testimonials";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error("Save failed");
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
    try {
      await fetch(`/api/testimonials/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Deleted");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleActive = async (t: Testimonial) => {
    await fetch(`/api/testimonials/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !t.isActive }),
    });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Success stories displayed across the site."
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="mr-2 h-4 w-4" /> New testimonial
          </button>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No testimonials yet"
          description="Add client success stories to build trust."
          action={
            <button onClick={openCreate} className="btn-primary">
              Add testimonial
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="card-base space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <Badge variant={t.isActive ? "success" : "muted"}>
                  {t.isActive ? "Active" : "Hidden"}
                </Badge>
              </div>

              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < t.rating ? "fill-amber-500" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>

              <p className="line-clamp-3 text-sm text-muted-foreground">
                "{t.message}"
              </p>

              <div className="flex justify-end gap-1 border-t border-border pt-3">
                <button
                  onClick={() => toggleActive(t)}
                  className="rounded-md p-2 hover:bg-accent"
                  title={t.isActive ? "Hide" : "Show"}
                >
                  {t.isActive ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
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
        title={editing ? "Edit testimonial" : "New testimonial"}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Role</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="input-base"
                placeholder="e.g., Software Engineer at Emirates Tech"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="input-base min-h-[100px] py-2"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Image URL (optional)
            </label>
            <input
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="input-base"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Rating</label>
              <select
                value={form.rating}
                onChange={(e) =>
                  setForm({ ...form, rating: Number(e.target.value) })
                }
                className="input-base"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
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
              <span>Visible on site</span>
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
        title="Delete testimonial?"
        message={`This will permanently delete "${deleteTarget?.name}"'s testimonial.`}
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}