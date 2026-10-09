"use client";

import { useEffect, useState } from "react";

type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  views: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBlogs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/blogs", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to load blogs");
      }

      setBlogs(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load blogs"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  async function togglePublished(blog: Blog) {
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toggle: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to update blog");
      }

      setBlogs((current) =>
        current.map((item) =>
          item.id === blog.id ? result.data : item
        )
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to update blog"
      );
    }
  }

  async function deleteBlog(blog: Blog) {
    const confirmed = window.confirm(
      `Delete "${blog.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to delete blog");
      }

      setBlogs((current) =>
        current.filter((item) => item.id !== blog.id)
      );
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete blog"
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Blogs
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage and publish career-related blog articles.
          </p>
        </div>

        <a
          href="/admin/blogs/new"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          + New Blog
        </a>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-background">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading blogs...
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center">
            <h2 className="text-lg font-semibold">
              No blogs yet
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Create your first blog article to get started.
            </p>

            <a
              href="/admin/blogs/new"
              className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Create Blog
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    Blog
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Views
                  </th>

                  <th className="px-4 py-3 text-left font-medium">
                    Created
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {blogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-muted/20">
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <div className="font-medium">
                          {blog.title}
                        </div>

                        <div className="mt-1 text-xs text-muted-foreground">
                          /{blog.slug}
                        </div>

                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {blog.excerpt}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => togglePublished(blog)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          blog.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {blog.isPublished
                          ? "Published"
                          : "Draft"}
                      </button>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {blog.views}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={`/admin/blogs/${blog.id}/edit`}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                        >
                          Edit
                        </a>

                        <button
                          type="button"
                          onClick={() => deleteBlog(blog)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}