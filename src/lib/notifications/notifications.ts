import type { ModuleName, Prisma, PrismaClient } from "@prisma/client";

export type NotificationInput = {
  recipientUserId: string;
  title: string;
  message: string;
  module: ModuleName;
  entityType: string;
  entityId: string;
};

export async function createNotification(
  prisma: PrismaClient | Prisma.TransactionClient,
  input: NotificationInput,
) {
  return prisma.notification.create({ data: input });
}

export async function markNotificationRead(
  prisma: PrismaClient | Prisma.TransactionClient,
  notificationId: string,
  recipientUserId: string,
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientUserId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}
