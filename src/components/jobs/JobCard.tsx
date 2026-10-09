import Link from "next/link";
import { MapPin, Building2, Clock, Briefcase, Wifi } from "lucide-react";
import { formatSalary, formatDate } from "@/lib/utils";
import type { Job, Category } from "../../../generated/prisma/client";

type JobWithCategory = Job & { category: Pick<Category, "id" | "name" | "slug"> | null };

export default function JobCard({ job }: { job: JobWithCategory }) {
  const isNew =
    Date.now() - new Date(job.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="group card-base flex flex-col gap-3 hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {job.category && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
              {job.category.name}
            </span>
          )}
          {job.remote && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
              <Wifi className="h-3 w-3" /> Remote
            </span>
          )}
          {isNew && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
              New
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(job.createdAt)}
        </span>
      </div>

      <div>
        <h3 className="font-semibold leading-tight group-hover:text-primary">
          {job.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> {job.company}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">
        {job.description}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="font-semibold text-primary">
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          {job.type.replace("_", " ")}
        </span>
      </div>
    </Link>
  );
}