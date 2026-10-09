import Link from "next/link";
import { Briefcase, FileText, Plane, Users, MessageSquare, ArrowRight, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatSalary } from "@/lib/utils";
import { Sparkles, Search as SearchIcon, Users as UsersIcon } from "lucide-react";

export const revalidate = 300;

const services = [
  { icon: FileText, title: "CV / Resume Preparation", desc: "ATS-friendly CVs tailored to UAE employers." },
  { icon: Briefcase, title: "Job Application Support", desc: "Hands-on help applying to verified UAE jobs." },
  { icon: MessageSquare, title: "Interview Preparation", desc: "Mock interviews and HR coaching." },
  { icon: Plane, title: "Travel & Documentation", desc: "Visa, attestation, and travel guidance." },
  { icon: Users, title: "Career Counseling", desc: "1-on-1 sessions with UAE career experts." },
];

export default async function HomePage() {
  const jobs = await prisma.job.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { category: true },
  });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-in">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Trusted by 5000+ job seekers
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-balance sm:text-5xl lg:text-6xl">
              Build your career in <span className="text-primary">Dubai & the UAE</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Verified job listings, professional CV help, interview coaching, and complete travel & documentation guidance — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/jobs" className="btn-primary">
                Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/services" className="btn-outline">Explore Services</Link>
            </div>
          </div>

          <div className="relative">
            <div className="card-base space-y-4">
              <h3 className="font-display text-lg font-semibold">Quick Job Search</h3>
              <form action="/jobs" className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="q"
                    placeholder="Job title, company, or keyword"
                    className="input-base pl-9"
                  />
                </div>
                <button type="submit" className="btn-primary">Search</button>
              </form>
              <p className="text-xs text-muted-foreground">
                Popular: Software Engineer, Nurse, Hotel Manager, Accountant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Our Services</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to succeed in the UAE job market.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-base">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
          <div className="card-base flex flex-col justify-center bg-primary text-primary-foreground">
            <h3 className="font-semibold">Need guidance?</h3>
            <p className="mt-1 text-sm opacity-90">Talk to a career expert today.</p>
            <Link href="/contact" className="btn-outline mt-4 w-fit bg-white text-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="bg-secondary/40 py-16">
        <div className="container-page">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Latest Jobs</h2>
              <p className="mt-1 text-muted-foreground">Fresh opportunities in Dubai and the UAE.</p>
            </div>
            <Link href="/jobs" className="hidden text-sm font-semibold text-primary sm:block">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.slug}`} className="card-base group">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                    {job.category?.name ?? "General"}
                  </span>
                  <span className="text-muted-foreground">{job.type.replace("_", " ")}</span>
                </div>
                <h3 className="mt-3 font-semibold group-hover:text-primary">{job.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{job.company} · {job.location}</p>
                <p className="mt-3 text-sm font-semibold text-primary">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </p>
              </Link>
            ))}
            {jobs.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">
                No jobs published yet. Check back soon.
              </p>
            )}
          </div>
        </div>
      </section>




      <section className="border-y border-border bg-secondary/40 py-16 lg:py-20">
  <div className="container-page">
    <div className="mb-10 max-w-2xl">
      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
        AI-Powered Tools
      </span>
      <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
        Smart tools for your job hunt
      </h2>
      <p className="mt-3 text-muted-foreground">
        Free AI-powered tools to help you find the right jobs faster.
      </p>
    </div>

    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[
        {
          icon: Sparkles,
          title: "Free CV Check",
          desc: "Upload your resume and get instant AI feedback.",
          href: "/resume-check",
        },
        {
          icon: SearchIcon,
          title: "Smart Search",
          desc: "Search jobs in plain English — AI understands meaning.",
          href: "/jobs/smart-search",
        },
        {
          icon: UsersIcon,
          title: "AI Job Match",
          desc: "Enter your skills and get ranked job recommendations.",
          href: "/job-match",
        },
      ].map(({ icon: Icon, title, desc, href }) => (
        <Link
          key={title}
          href={href}
          className="card-base group transition hover:border-primary/40"
        >
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-semibold group-hover:text-primary">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Try it <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>




      {/* CTA */}
      <section className="container-page py-16">
        <div className="rounded-2xl gradient-gold p-10 text-center text-white shadow-lg">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to start your UAE career?</h2>
          <p className="mx-auto mt-3 max-w-2xl opacity-95">
            Join thousands of job seekers who trusted us to guide them into Dubai's top employers.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="rounded-lg bg-white px-6 py-3 font-semibold text-primary shadow hover:bg-white/90">
              Get Started
            </Link>
            <Link href="/jobs" className="rounded-lg border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}