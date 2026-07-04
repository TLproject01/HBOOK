type NotificationReadPrisma = {
  notification: {
    updateMany: (args: {
      where: { id: string; recipientUserId: string };
      data: { isRead: true; readAt: Date };
    }) => Promise<{ count: number }>;
  };
};

export type MarkOwnNotificationReadInput = {
  notificationId: string;
  userId: string;
  prisma: NotificationReadPrisma;
  now?: () => Date;
};

export async function markOwnNotificationRead(input: MarkOwnNotificationReadInput) {
  const now = input.now ?? (() => new Date());

  return input.prisma.notification.updateMany({
    where: {
      id: input.notificationId,
      recipientUserId: input.userId,
    },
    data: {
      isRead: true,
      readAt: now(),
    },
  });
}
