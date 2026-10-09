import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { faqSchema } from "@/lib/validations/faq.schema";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";

  const session = await auth();
  const isAdmin =
    session && ["ADMIN", "EDITOR"].includes((session.user as any).role);

  const faqs = await prisma.fAQ.findMany({
    where: !all || !isAdmin ? { isActive: true } : {},
    orderBy: {
  order: "asc",
},
  });

  return NextResponse.json({ success: true, data: faqs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = faqSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data = { ...parsed.data, category: parsed.data.category || null };
  const faq = await prisma.fAQ.create({ data });
  await logAction({ action: "CREATE_FAQ", entity: "FAQ", entityId: faq.id });
  return NextResponse.json({ success: true, data: faq }, { status: 201 });
}