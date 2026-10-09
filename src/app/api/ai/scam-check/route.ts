import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { aiClient } from "@/lib/ai-client";
import { scamCheckSchema } from "@/lib/validations/ai.schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = scamCheckSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await aiClient.scamCheck(parsed.data);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error("AI scam-check error:", err);
    return NextResponse.json(
      { success: false, error: err.message ?? "AI service unavailable" },
      { status: 500 }
    );
  }
}