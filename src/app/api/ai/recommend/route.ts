import { NextRequest, NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";
import { recommendSchema } from "@/lib/validations/ai.schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = recommendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { skills, job_titles, summary, top_k } = parsed.data;

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
        location: true,
        description: true,
        requirements: true,
        salaryMin: true,
        salaryMax: true,
        currency: true,
        type: true,
      },
    });

    if (jobs.length === 0) {
      return NextResponse.json({ success: true, data: { recommendations: [] } });
    }

    const aiResult = await aiClient.recommendJobs({
      skills,
      job_titles,
      summary,
      jobs: jobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        requirements: j.requirements,
      })),
      top_k: top_k ?? 5,
    });

    const hydrated = aiResult.recommendations
      .map((r) => {
        const job = jobs.find((j) => j.id === r.id);
        if (!job) return null;
        return { ...job, matchScore: r.score, reason: r.reason };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: { recommendations: hydrated } });
  } catch (err: any) {
    console.error("AI recommend error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "AI service unavailable" },
      { status: 500 }
    );
  }
}