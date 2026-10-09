import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { blogSchema } from "@/lib/validations/blog.schema";
import { slugify } from "@/lib/utils";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "true";
  const session = await auth();
  const isAdmin =
    session && ["ADMIN", "EDITOR"].includes((session.user as any).role);

  const blogs = await prisma.blog.findMany({
    where: !all || !isAdmin ? { isPublished: true } : {},
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: blogs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slug = parsed.data.slug ?? slugify(parsed.data.title);

  const blog = await prisma.blog.create({
    data: {
      ...parsed.data,
      slug,
      coverImage: parsed.data.coverImage || null,
      authorId: (session.user as any).id,
    },
  });

  await logAction({ action: "CREATE_BLOG", entity: "Blog", entityId: blog.id });
  return NextResponse.json({ success: true, data: blog }, { status: 201 });
}
