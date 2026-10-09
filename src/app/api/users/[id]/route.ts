import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { role } = await req.json();

  if (!["USER", "EDITOR", "ADMIN"].includes(role))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  // Prevent self-demotion
  if (id === (session.user as any).id && role !== "ADMIN")
    return NextResponse.json(
      { error: "You cannot change your own role" },
      { status: 400 }
    );

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });

  await logAction({
    action: "UPDATE_USER_ROLE",
    entity: "User",
    entityId: id,
    metadata: { role },
  });

  return NextResponse.json({ success: true, data: user });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (id === (session.user as any).id)
    return NextResponse.json(
      { error: "You cannot delete yourself" },
      { status: 400 }
    );

  await prisma.user.delete({ where: { id } });
  await logAction({ action: "DELETE_USER", entity: "User", entityId: id });
  return NextResponse.json({ success: true });
}