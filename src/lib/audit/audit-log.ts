import type { ModuleName, Prisma, PrismaClient } from "@prisma/client";

export type AuditLogInput = {
  actorUserId?: string;
  action: string;
  module: ModuleName;
  entityType: string;
  entityId: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(
  prisma: PrismaClient | Prisma.TransactionClient,
  input: AuditLogInput,
) {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      module: input.module,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: input.oldValues,
      newValues: input.newValues,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}
