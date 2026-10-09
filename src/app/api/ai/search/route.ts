import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";
import { searchSchema } from "@/lib/validations/ai.schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = searchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { query, top_k } = parsed.data;

    // Fetch published jobs to search over
    const jobs = await prisma.job.findMany({
      where: {
        isPublished: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        company: true,
        description: true,
        requirements: true,
      },
    });

    if (jobs.length === 0) {
      return NextResponse.json({ success: true, data: { results: [] } });
    }

    const aiResult = await aiClient.searchJobs({
      query,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        requirements: j.requirements,
      })),
      top_k: top_k ?? 10,
    });

    // Hydrate results with job details
    const hydrated = aiResult.results
      .map((r) => {
        const job = jobs.find((j) => j.id === r.id);
        if (!job) return null;
        return { ...job, score: r.score };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: { results: hydrated } });
  } catch (err: any) {
    console.error("AI search error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "AI service unavailable" },
      { status: 500 }
    );
  }
}