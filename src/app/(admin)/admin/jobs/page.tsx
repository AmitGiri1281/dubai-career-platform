import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getJobCategories } from "@/services/jobs.service";
import JobForm from "@/components/admin/JobForm";

export default async function NewJobPage() {
  const categories = await getJobCategories();

  return (
    <div>
      <Link
        href="/admin/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold">Create job</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Fill in the details below. You can save as draft or publish immediately.
      </p>

      <JobForm categories={categories} />
    </div>
  );
}