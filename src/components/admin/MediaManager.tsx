"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Loader2, Trash2, Copy, ImageIcon } from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";

interface Media {
  id: string;
  url: string;
  publicId: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function MediaManager() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      // 1. Get signed payload
      const sigRes = await fetch("/api/upload", { method: "POST" });
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error ?? "Sign failed");

      // 2. Upload each file
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("signature", sig.signature);
        fd.append("folder", sig.folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
          { method: "POST", body: fd }
        );
        const uploaded = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploaded.error?.message ?? "Upload failed");

        // 3. Persist record
        await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            type: uploaded.resource_type,
            size: uploaded.bytes,
          }),
        });
      }

      toast.success("Upload complete");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/media/${deleteTarget.id}`, { method: "DELETE" });
    toast.success("Deleted");
    setDeleteTarget(null);
    load();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Upload and manage images and files."
        action={
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleUpload(e.target.files)}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload
            </button>
          </>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No media yet"
          description="Upload images to use in blogs, testimonials, and job listings."
          action={
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-primary"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload image
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="group overflow-hidden rounded-xl border border-border bg-card">
              <div className="relative aspect-square bg-secondary">
                {m.type === "image" ? (
                  <Image
                    src={m.url}
                    alt={m.publicId}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => copyUrl(m.url)}
                    className="rounded-full bg-white p-2 text-foreground hover:bg-white/90"
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="rounded-full bg-destructive p-2 text-white hover:bg-destructive/90"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-3 text-xs text-muted-foreground">
                {formatDate(m.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete media?"
        message="This removes the file from Cloudinary and the library."
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}