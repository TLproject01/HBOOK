import { describe, expect, it } from "vitest";

import { markOwnNotificationRead } from "@/server/services/notifications/read";

describe("notification read service", () => {
  it("marks only the current user's notification as read", async () => {
    const readAt = new Date("2026-07-03T11:00:00.000Z");
    const calls: unknown[] = [];
    const prisma = {
      notification: {
        updateMany: async (args: unknown) => {
          calls.push(args);
          return { count: 1 };
        },
      },
    };

    const result = await markOwnNotificationRead({
      notificationId: "notification-1",
      now: () => readAt,
      prisma,
      userId: "user-1",
    });

    expect(result.count).toBe(1);
    expect(calls).toEqual([
      {
        where: {
          id: "notification-1",
          recipientUserId: "user-1",
        },
        data: {
          isRead: true,
          readAt,
        },
      },
    ]);
  });
});
