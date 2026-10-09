import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { faqSchema } from "@/lib/validations/faq.schema";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return null;
  return session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = faqSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = { ...parsed.data };
  if (data.category === "") data.category = null;

  const faq = await prisma.fAQ.update({ where: { id }, data });
  await logAction({ action: "UPDATE_FAQ", entity: "FAQ", entityId: id });
  return NextResponse.json({ success: true, data: faq });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.fAQ.delete({ where: { id } });
  await logAction({ action: "DELETE_FAQ", entity: "FAQ", entityId: id });
  return NextResponse.json({ success: true });
}