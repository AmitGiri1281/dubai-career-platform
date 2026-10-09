import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: media });
}

/** Save media record after client-side Cloudinary upload succeeds */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, publicId, type, size } = await req.json();
  if (!url || !publicId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const media = await prisma.media.create({
    data: {
      url,
      publicId,
      type: type ?? "image",
      size: size ?? 0,
      uploadedBy: (session.user as any).id,
    },
  });

  return NextResponse.json({ success: true, data: media }, { status: 201 });
}