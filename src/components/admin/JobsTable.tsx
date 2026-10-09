"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Edit3, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { formatDate, formatSalary } from "@/lib/utils";

interface JobRow {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  type: string;
  isPublished: boolean;
  views: number;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  createdAt: string | Date;
  category: { name: string } | null;
}

export default function JobsTable({ jobs }: { jobs: JobRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const togglePublish = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/jobs/id/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toggle: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Publish state updated");
      router.refresh();
    } catch {
      toast.error("Could not update job");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/jobs/id/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Job deleted");
      router.refresh();
    } catch {
      toast.error("Could not delete job");
    } finally {
      setBusyId(null);
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card py-16 text-center">
        <p className="text-muted-foreground">No jobs yet.</p>
        <Link href="/admin/jobs/new" className="btn-primary mt-4 inline-flex">
          Create your first job
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Job</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Salary</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Views</th>
              <th className="px-5 py-3 font-medium">Posted</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-5 py-4">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {job.company} · {job.location}
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {job.category?.name ?? "—"}
                </td>
                <td className="px-5 py-4">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {job.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{job.views}</td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(job.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => togglePublish(job.id)}
                      disabled={busyId === job.id}
                      className="rounded-md p-2 hover:bg-accent"
                      title={job.isPublished ? "Unpublish" : "Publish"}
                    >
                      {busyId === job.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : job.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={`/admin/jobs/${job.id}/edit`}
                      className="rounded-md p-2 hover:bg-accent"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => remove(job.id, job.title)}
                      disabled={busyId === job.id}
                      className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                      title="Delete"
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
    </div>
  );
}