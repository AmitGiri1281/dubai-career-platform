import type { Metadata } from "next";
import { listJobs, getJobCategories } from "@/services/jobs.service";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import Pagination from "@/components/jobs/Pagination";
import { Briefcase } from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jobs in Dubai & UAE | Dubai Career Support",
  description:
    "Browse verified job opportunities in Dubai and across the UAE. Filter by category, type, location, salary, and remote options.",
  alternates: { canonical: "/jobs" },
  openGraph: {
    title: "Jobs in Dubai & UAE",
    description:
      "Browse verified job opportunities in Dubai and across the UAE.",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const [result, categories] = await Promise.all([
    listJobs({
      q: get("q"),
      categoryId: get("categoryId"),
      type: get("type") as any,
      remote:
        get("remote") === "true"
          ? true
          : get("remote") === "false"
          ? false
          : undefined,
      company: get("company"),
      location: get("location"),
      salaryMin: get("salaryMin") ? Number(get("salaryMin")) : undefined,
      salaryMax: get("salaryMax") ? Number(get("salaryMax")) : undefined,
      page: get("page") ? Number(get("page")) : 1,
      limit: 9,
    }),
    getJobCategories(),
  ]);

  return (
    <section className="container-page py-10 lg:py-14">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Briefcase className="h-4 w-4" />
          <span>Job Opportunities</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Find your next role in Dubai
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {result.total > 0
            ? `${result.total} live opportunities matching your search.`
            : "No jobs match your filters yet — try adjusting them."}
        </p>
      </div>

      <JobFilters categories={categories} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar is inside JobFilters; this column shows job grid */}
        <div className="hidden lg:block" />
        <div>
          {result.jobs.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing filters or search keywords.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {result.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination page={result.page} pages={result.pages} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}