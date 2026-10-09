import { prisma } from "@/lib/prisma";
import type { Prisma, Job } from "../../generated/prisma/client";
import { slugify } from "@/lib/utils";
import type { JobInput } from "@/lib/validations/job.schema";

export interface JobFilters {
  q?: string;
  categoryId?: string;
  type?: "FULL_TIME" | "PART_TIME" | "CONTRACT";
  remote?: boolean;
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  includeUnpublished?: boolean;
}

export interface JobListResult {
  jobs: (Job & { category: { id: string; name: string; slug: string } | null })[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Build a Prisma where clause from filters.
 */
function buildWhere(filters: JobFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {};

  if (!filters.includeUnpublished) {
    where.isPublished = true;
    // Exclude expired jobs from public listing
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ];
  }

  if (filters.q) {
    const q = filters.q.trim();
    const search: Prisma.JobWhereInput = {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    };

    // Combine with existing isPublished/OR filter
    where.AND = [search];
  }

  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.type) where.type = filters.type;
  if (filters.remote !== undefined) where.remote = filters.remote;
  if (filters.company)
    where.company = { contains: filters.company, mode: "insensitive" };
  if (filters.location)
    where.location = { contains: filters.location, mode: "insensitive" };

  if (filters.salaryMin !== undefined || filters.salaryMax !== undefined) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { salaryMax: { gte: filters.salaryMin ?? 0 } },
          { salaryMin: { gte: filters.salaryMin ?? 0 } },
        ],
      },
    ];
  }

  return where;
}

/**
 * Paginated list of jobs for public + admin.
 */
export async function listJobs(filters: JobFilters = {}): Promise<JobListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 9));
  const where = buildWhere(filters);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return {
    jobs,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
  };
}

/**
 * Get single job by slug (public).
 */
export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: { slug },
    include: { category: true },
  });
}

/**
 * Get single job by ID (admin).
 */
export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: { category: true },
  });
}

/**
 * Increment views counter.
 */
export async function incrementJobViews(id: string) {
  try {
    await prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch {
    // silent — don't break page if increment fails
  }
}

/**
 * Create a job with auto-generated unique slug.
 */
export async function createJob(data: JobInput) {
  const baseSlug = slugify(data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  return prisma.job.create({
    data: {
      ...data,
      slug,
    },
    include: { category: true },
  });
}

/**
 * Update a job. Regenerates slug only if title changed.
 */
export async function updateJob(id: string, data: Partial<JobInput>) {
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing) throw new Error("Job not found");

  let slug = existing.slug;
  if (data.title && data.title !== existing.title) {
    slug = await ensureUniqueSlug(slugify(data.title), id);
  }

  return prisma.job.update({
    where: { id },
    data: { ...data, slug },
    include: { category: true },
  });
}

/**
 * Delete a job.
 */
export async function deleteJob(id: string) {
  return prisma.job.delete({ where: { id } });
}

/**
 * Toggle publish state.
 */
export async function togglePublish(id: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");

  return prisma.job.update({
    where: { id },
    data: { isPublished: !job.isPublished },
  });
}

/**
 * Ensure slug uniqueness. Append -2, -3, … until available.
 */
async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let counter = 1;

  while (true) {
    const conflict = await prisma.job.findUnique({ where: { slug } });
    if (!conflict || conflict.id === excludeId) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

/**
 * Get categories for filter dropdowns.
 */
export async function getJobCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

/**
 * Get distinct companies (for company filter).
 */
export async function getDistinctCompanies() {
  const rows = await prisma.job.findMany({
    where: { isPublished: true },
    select: { company: true },
    distinct: ["company"],
    orderBy: { company: "asc" },
  });
  return rows.map((r) => r.company);
}

/**
 * Related jobs — same category, excluding current.
 */
export async function getRelatedJobs(jobId: string, categoryId: string | null, limit = 3) {
  return prisma.job.findMany({
    where: {
      isPublished: true,
      id: { not: jobId },
      ...(categoryId ? { categoryId } : {}),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}