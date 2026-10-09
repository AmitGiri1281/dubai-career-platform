import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { blogSchema } from "@/lib/validations/blog.schema";
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

  if (body?.toggle === true) {
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const blog = await prisma.blog.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
    });
    return NextResponse.json({ success: true, data: blog });
  }

  const parsed = blogSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = { ...parsed.data };
  if (data.coverImage === "") data.coverImage = null;

  const blog = await prisma.blog.update({ where: { id }, data });
  await logAction({ action: "UPDATE_BLOG", entity: "Blog", entityId: id });
  return NextResponse.json({ success: true, data: blog });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.blog.delete({ where: { id } });
  await logAction({ action: "DELETE_BLOG", entity: "Blog", entityId: id });
  return NextResponse.json({ success: true });
}