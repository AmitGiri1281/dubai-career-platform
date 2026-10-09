import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import cloudinary, { CLOUDINARY_FOLDER } from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * Returns a signed payload the client can use to upload directly to Cloudinary.
 * Client flow:
 *   1. POST /api/upload to get { signature, timestamp, apiKey, cloudName, folder }
 *   2. POST to https://api.cloudinary.com/v1_1/{cloudName}/auto/upload with FormData
 */
export async function POST() {
  const session = await auth();
  if (!session || !["ADMIN", "EDITOR"].includes((session.user as any).role))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { timestamp, folder: CLOUDINARY_FOLDER };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: CLOUDINARY_FOLDER,
  });
}