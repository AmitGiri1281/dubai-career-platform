"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { blogSchema, type BlogInput } from "@/lib/validations/blog.schema";

interface Props {
  defaultValues?: Partial<BlogInput> & { id?: string };
}

export default function BlogForm({ defaultValues }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(defaultValues?.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema) as any,
    defaultValues: {
      isPublished: false,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: BlogInput) => {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/blogs/${defaultValues!.id}` : "/api/blogs";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          typeof json.error === "string"
            ? json.error
            : "Validation failed. Check your inputs."
        );
      }

      toast.success(isEdit ? "Blog updated" : "Blog created");
      router.push("/admin/blogs");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const isPublished = watch("isPublished");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <input
              {...register("title")}
              className="input-base"
              placeholder="e.g., 10 Tips for Landing a Dubai Job"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Excerpt</label>
            <textarea
              {...register("excerpt")}
              rows={2}
              className="input-base py-2"
              placeholder="Short summary shown in listings (10-300 chars)"
            />
            {errors.excerpt && (
              <p className="mt-1 text-xs text-destructive">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Content</label>
            <textarea
              {...register("content")}
              rows={14}
              className="input-base min-h-[300px] py-2 font-mono text-xs"
              placeholder="Write your article…"
            />
            {errors.content && (
              <p className="mt-1 text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Cover image URL (optional)
            </label>
            <input
              {...register("coverImage")}
              className="input-base"
              placeholder="https://res.cloudinary.com/…"
            />
            {errors.coverImage && (
              <p className="mt-1 text-xs text-destructive">
                {errors.coverImage.message}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!isPublished}
                onChange={(e) => setValue("isPublished", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span>Publish immediately</span>
            </label>

            <p className="text-xs text-muted-foreground">
              {isPublished
                ? "✅ This blog will be visible to the public."
                : "💾 Saved as draft. Not visible publicly."}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Create blog"}
          </button>
        </aside>
      </div>
    </form>
  );
}