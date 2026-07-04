import type { Prisma, PrismaClient } from "@prisma/client";

import { assertValidTimeRange, type TimeRange } from "./overlap";

const blockingRoomStatuses = ["APPROVED"] as const;

export async function isRoomAvailable(
  prisma: PrismaClient | Prisma.TransactionClient,
  roomId: string,
  range: TimeRange,
  ignoreBookingId?: string,
) {
  assertValidTimeRange(range);

  const conflict = await prisma.roomBooking.findFirst({
    where: {
      id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
      roomId,
      status: { in: [...blockingRoomStatuses] },
      startAt: { lt: range.endAt },
      endAt: { gt: range.startAt },
    },
    select: { id: true },
  });

  return !conflict;
}
