import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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
  const { status } = await req.json();
  if (!["NEW", "IN_PROGRESS", "CLOSED"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
  });
  await logAction({
    action: "UPDATE_INQUIRY_STATUS",
    entity: "Inquiry",
    entityId: id,
    metadata: { status },
  });
  return NextResponse.json({ success: true, data: inquiry });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.inquiry.delete({ where: { id } });
  await logAction({ action: "DELETE_INQUIRY", entity: "Inquiry", entityId: id });
  return NextResponse.json({ success: true });
}