import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(media.publicId);
  } catch (err) {
    console.warn("Cloudinary destroy failed:", err);
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ success: true });
}