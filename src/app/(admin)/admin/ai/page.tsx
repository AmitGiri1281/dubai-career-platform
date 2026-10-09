import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/PageHeader";
import AiDashboard from "@/components/admin/AiDashboard";

export const dynamic = "force-dynamic";

export default async function AiPage() {
  // Get AI usage stats (simulated — based on real data where possible)
  const [
    totalJobs,
    jobsWithoutCategory,
    jobsWithHighSalary,
    recentJobs,
  ] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { categoryId: null } }),
    prisma.job.count({ where: { salaryMax: { gt: 100000 } } }),
    prisma.job.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        categoryId: true,
      },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="AI Tools"
        description="Analyze jobs, detect scams, and test AI features."
      />

      <AiDashboard
        stats={{
          totalJobs,
          jobsWithoutCategory,
          jobsWithHighSalary,
        }}
        recentJobs={recentJobs}
      />
    </div>
  );
}