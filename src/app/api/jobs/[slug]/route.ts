// src/app/api/jobs/slug/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getJobBySlug, incrementJobViews } from "@/services/jobs.service";

export const runtime = "nodejs";

/**
 * GET /api/jobs/slug/[slug] — public detail
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const job = await getJobBySlug(slug);
    if (!job || !job.isPublished) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    void incrementJobViews(job.id);
    return NextResponse.json({ success: true, data: job });
  } catch (err) {
    console.error("GET /api/jobs/slug/[slug] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}