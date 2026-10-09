import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Briefcase,
  Wifi,
  Calendar,
  ArrowLeft,
  Eye,
  Share2,
} from "lucide-react";
import {
  getJobBySlug,
  getRelatedJobs,
  incrementJobViews,
} from "@/services/jobs.service";
import { formatSalary, formatDate } from "@/lib/utils";
import ApplyButton from "@/components/jobs/ApplyButton";
import JobCard from "@/components/jobs/JobCard";
import ScamWarningBadge from "@/components/jobs/ScamWarningBadge";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job) {
    return { title: "Job not found" };
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`;
  const description = `${job.title} at ${job.company} — ${job.location}. ${job.description.slice(0, 140)}…`;

  return {
    title: `${job.title} at ${job.company} | Dubai Career Support`,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: `${job.title} at ${job.company}`,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.company}`,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job || !job.isPublished) notFound();

  // Fire-and-forget view increment
  void incrementJobViews(job.id);

  const related = await getRelatedJobs(job.id, job.categoryId, 3);
  const jobUrl = `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}`;

  return (
    <article className="container-page py-10 lg:py-14">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <header className="mt-6 grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-[1fr_320px] lg:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {job.category && (
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {job.category.name}
              </span>
            )}
            {job.remote && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700">
                <Wifi className="h-3 w-3" /> Remote
              </span>
            )}
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
              {job.type.replace("_", " ")}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {job.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-4 w-4" /> {job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> Posted {formatDate(job.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {job.views} views
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-secondary/40 p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Salary
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </p>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">{job.type.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium">{job.category?.name ?? "General"}</span>
            </div>
            {job.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Apply before</span>
                <span className="font-medium">{formatDate(job.expiresAt)}</span>
              </div>
            )}
          </div>

          <div className="mt-5">
            <ApplyButton
              jobTitle={job.title}
              company={job.company}
              jobUrl={jobUrl}
            />
          </div>
        </div>
      </header>

      <Link
  href="/jobs"
  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="h-4 w-4" /> Back to jobs
</Link>

{/* ⬇️ ADD THIS */}
<ScamWarningBadge
  jobId={job.id}
  title={job.title}
  description={job.description}
  requirements={job.requirements}
  company={job.company}
  salaryMin={job.salaryMin}
  salaryMax={job.salaryMax}
/>

<header className="mt-6 ..."></header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <h2 className="font-display text-xl font-semibold">
              Job Description
            </h2>
            <div className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {job.description}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <h2 className="font-display text-xl font-semibold">Requirements</h2>
            <div className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {job.requirements}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">Share this job</h3>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(jobUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline w-full justify-center"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-secondary/40 p-6">
            <h3 className="font-semibold">Need career help?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team can prepare your CV, coach you for interviews, and guide
              you through UAE documentation.
            </p>
            <Link href="/services" className="btn-primary mt-4 w-full justify-center">
              Explore Services
            </Link>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">Related jobs</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((j) => (
              <JobCard key={j.id} job={j as any} />
            ))}
          </div>
        </section>
      )}

      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            datePosted: job.createdAt.toISOString(),
            validThrough: job.expiresAt?.toISOString(),
            employmentType: job.type,
            hiringOrganization: {
              "@type": "Organization",
              name: job.company,
            },
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job.location,
                addressCountry: "AE",
              },
            },
            baseSalary: {
              "@type": "MonetaryAmount",
              currency: job.currency,
              value: {
                "@type": "QuantitativeValue",
                minValue: job.salaryMin,
                maxValue: job.salaryMax,
                unitText: "MONTH",
              },
            },
          }),
        }}
      />
    </article>
  );
}