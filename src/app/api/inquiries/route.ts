import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validations/inquiry.schema";
import { rateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/inquiries?status=ALL
 * Admin/Editor only
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "EDITOR"].includes(
        (session.user as { role?: string }).role ?? ""
      )
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const status = req.nextUrl.searchParams.get("status") ?? "ALL";

    const validStatuses = ["ALL", "NEW", "IN_PROGRESS", "CLOSED"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const inquiries = await prisma.inquiry.findMany({
      where:
        status === "ALL"
          ? {}
          : {
              status,
            },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: inquiries,
    });
  } catch (error) {
    console.error("GET /api/inquiries error:", error);

    return NextResponse.json(
      { error: "Failed to load inquiries" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inquiries
 * Public contact/inquiry submission
 */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const { success } = await rateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();

    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: parsed.data,
    });

    return NextResponse.json(
      {
        success: true,
        id: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/inquiries error:", error);

    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}