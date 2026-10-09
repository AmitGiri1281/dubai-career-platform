import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/category.schema";
import { slugify } from "@/lib/utils";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

/** GET /api/categories — public */
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { jobs: true } } },
  });
  return NextResponse.json({ success: true, data: categories });
}

/** POST /api/categories — admin */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const slug = parsed.data.slug ?? slugify(parsed.data.name);

  try {
    const category = await prisma.category.create({
      data: { name: parsed.data.name, slug },
    });
    await logAction({
      action: "CREATE_CATEGORY",
      entity: "Category",
      entityId: category.id,
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "Category with this name/slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}