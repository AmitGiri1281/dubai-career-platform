import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [
    totalJobs,
    publishedJobs,
    totalViews,
    totalInquiries,
    newInquiries,
    totalUsers,
    topCategories,
    viewsByDay,
    inquiriesByDay,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { isPublished: true } }),
    prisma.job.aggregate({ _sum: { views: true } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.user.count(),
    prisma.category.findMany({
      select: {
        name: true,
        _count: { select: { jobs: true } },
      },
      orderBy: { jobs: { _count: "desc" } },
      take: 6,
    }),
    // last 14 days job views (per job sum per day is not stored; approximate by job createdAt count)
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as day, COUNT(*)::int as count
      FROM "Job"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
    prisma.$queryRaw<{ day: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as day, COUNT(*)::int as count
      FROM "Inquiry"
      WHERE "createdAt" >= NOW() - INTERVAL '14 days'
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
  ]);

  const jobsByDay = viewsByDay.map((r) => ({
    day: new Date(r.day).toISOString().slice(5, 10),
    count: Number(r.count),
  }));
  const inquiriesTrend = inquiriesByDay.map((r) => ({
    day: new Date(r.day).toISOString().slice(5, 10),
    count: Number(r.count),
  }));

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Platform activity at a glance."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Jobs", value: totalJobs },
          { label: "Published", value: publishedJobs },
          { label: "Total views", value: totalViews._sum.views ?? 0 },
          { label: "Inquiries", value: totalInquiries },
          { label: "New", value: newInquiries },
          { label: "Users", value: totalUsers },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        topCategories={topCategories.map((c) => ({
          name: c.name,
          count: c._count.jobs,
        }))}
        jobsByDay={jobsByDay}
        inquiriesTrend={inquiriesTrend}
      />
    </div>
  );
}