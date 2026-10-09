"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import PageHeader from "./PageHeader";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  views: number;
  createdAt: string;
}

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  isPublished: false,
};

export default function BlogManager() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs?all=true");
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
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditing(b);
    setForm({
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage ?? "",
      isPublished: b.isPublished,
    });
    setModalOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/blogs/${editing.id}` : "/api/blogs";
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
    await fetch(`/api/blogs/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("Deleted");
    setDeleteTarget(null);
    load();
  };

  const togglePublish = async (b: Blog) => {
    await fetch(`/api/blogs/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toggle: true }),
    });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Write and publish articles for SEO and engagement."
        action={
          <Link href="/admin/blogs/new" className="btn-primary">
  <Plus className="mr-2 h-4 w-4" /> New blog
</Link>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No blogs yet"
          description="Write your first article."
          action={
            <button onClick={openCreate} className="btn-primary">
              Write blog
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="card-base flex gap-4">
              {b.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.coverImage}
                  alt={b.title}
                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{b.title}</h3>
                  <Badge variant={b.isPublished ? "success" : "muted"}>
                    {b.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {b.views} views · {formatDate(b.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {b.excerpt}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => togglePublish(b)}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  {b.isPublished ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(b)}
                  className="rounded-md p-2 hover:bg-accent"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(b)}
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
        title={editing ? "Edit blog" : "New blog"}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="input-base py-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={10}
              className="input-base min-h-[240px] py-2 font-mono text-xs"
              placeholder="Markdown or plain text supported"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Cover image URL
            </label>
            <input
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="input-base"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="h-4 w-4 rounded border-border"
            />
            <span>Publish immediately</span>
          </label>
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
        title="Delete blog?"
        message={`This will permanently delete "${deleteTarget?.title}".`}
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}