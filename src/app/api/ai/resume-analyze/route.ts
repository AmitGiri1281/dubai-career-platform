import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiClient } from "@/lib/ai-client";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/ai/resume-analyze
 * Body: multipart/form-data with `file` field (PDF)
 * Auth: logged-in user OR public (rate-limited)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File too large (max 5MB)" },
        { status: 413 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    const result = await aiClient.analyzeResume(file);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("AI resume-analyze error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "AI service unavailable" },
      { status: 500 }
    );
  }
}