import { NextResponse } from "next/server";
import { aiClient } from "@/lib/ai-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await aiClient.health();
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "AI service unreachable" },
      { status: 503 }
    );
  }
}