// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { jobSchema } from "@/lib/validations/job.schema";
import {
  deleteJob,
  getJobById,
  togglePublish,
  updateJob,
} from "@/services/jobs.service";
import { logAction } from "@/lib/audit-log";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await auth();
  if (
    !session ||
    !["ADMIN", "EDITOR"].includes((session.user as any).role as string)
  ) {
    return null;
  }
  return session;
}

/**
 * GET /api/jobs/[id] — admin single by id
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: job });
}

/**
 * PATCH /api/jobs/[id] — update or toggle publish
 * Body: { toggle: true } toggles; otherwise partial job fields.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();

    if (body?.toggle === true) {
      const updated = await togglePublish(id);
      await logAction({
        action: "TOGGLE_JOB_PUBLISH",
        entity: "Job",
        entityId: id,
        metadata: { isPublished: updated.isPublished },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    const parsed = jobSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await updateJob(id, parsed.data);
    await logAction({ action: "UPDATE_JOB", entity: "Job", entityId: id });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH /api/jobs/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update job" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/jobs/[id] — admin delete
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  try {
    await deleteJob(id);
    await logAction({ action: "DELETE_JOB", entity: "Job", entityId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/jobs/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete job" },
      { status: 500 }
    );
  }
}