import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function logAction(params: {
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    const session = await auth();
    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: (params.metadata as any) ?? undefined,
        ip: params.ip,
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}