import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { testimonialSchema } from "@/lib/validations/testimonial.schema";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const session = await auth();
  const isAdmin =
    session && ["ADMIN", "EDITOR"].includes((session.user as any).role);

  const testimonials = await prisma.testimonial.findMany({
    where: !all || !isAdmin ? { isActive: true } : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: testimonials });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = {
    ...parsed.data,
    imageUrl: parsed.data.imageUrl || null,
  };

  const t = await prisma.testimonial.create({ data });
  await logAction({
    action: "CREATE_TESTIMONIAL",
    entity: "Testimonial",
    entityId: t.id,
  });
  return NextResponse.json({ success: true, data: t }, { status: 201 });
}