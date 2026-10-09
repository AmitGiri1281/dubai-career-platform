import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobSchema } from "@/lib/validations/job.schema";
import { createJob, listJobs } from "@/services/jobs.service";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

/**
 * GET /api/jobs
 * Public listing with filters: q, categoryId, type, remote, company, location,
 * salaryMin, salaryMax, page, limit
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await auth();
  const isAdmin = Boolean(
  session &&
    ["ADMIN", "EDITOR"].includes((session.user as any).role as string)
);

    const filters = {
      q: searchParams.get("q") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      type: (searchParams.get("type") as any) ?? undefined,
      remote:
        searchParams.get("remote") === "true"
          ? true
          : searchParams.get("remote") === "false"
          ? false
          : undefined,
      company: searchParams.get("company") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      salaryMin: searchParams.get("salaryMin")
        ? Number(searchParams.get("salaryMin"))
        : undefined,
      salaryMax: searchParams.get("salaryMax")
        ? Number(searchParams.get("salaryMax"))
        : undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 9,
      includeUnpublished:
        isAdmin && searchParams.get("includeUnpublished") === "true",
    };

    const result = await listJobs(filters);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("GET /api/jobs error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs — Admin only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["ADMIN", "EDITOR"].includes((session.user as any).role as string)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const job = await createJob(parsed.data);
    await logAction({
      action: "CREATE_JOB",
      entity: "Job",
      entityId: job.id,
      metadata: { title: job.title },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (err) {
    console.error("POST /api/jobs error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
      { status: 500 }
    );
  }
}