import Link from "next/link";
import { Briefcase, Inbox, Star, Users, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [jobsCount, publishedJobs, inquiries, newInquiries, testimonials, users] =
    await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { isPublished: true } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.testimonial.count(),
      prisma.user.count(),
    ]);

  const recentJobs = await prisma.job.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, company: true, isPublished: true },
  });

  const cards = [
    { label: "Total jobs", value: jobsCount, icon: Briefcase, href: "/admin/jobs" },
    { label: "Published", value: publishedJobs, icon: Briefcase, href: "/admin/jobs" },
    { label: "New inquiries", value: newInquiries, icon: Inbox, href: "/admin/inquiries" },
    { label: "Total inquiries", value: inquiries, icon: Inbox, href: "/admin/inquiries" },
    { label: "Testimonials", value: testimonials, icon: Star, href: "/admin/testimonials" },
    { label: "Users", value: users, icon: Users, href: "/admin/users" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your platform activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="card-base flex items-center justify-between hover:border-primary/40"
          >
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-bold">{value}</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent jobs</h2>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card">
          {recentJobs.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentJobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="font-medium">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.company}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      j.isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {j.isPublished ? "Published" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}