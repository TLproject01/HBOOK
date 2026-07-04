import type { Prisma, PrismaClient } from "@prisma/client";

import { assertValidTimeRange, type TimeRange } from "./overlap";

const blockingVehicleStatuses = ["PENDING", "APPROVED"] as const;
const blockingDriverStatuses = ["APPROVED"] as const;

export async function isVehicleAvailable(
  prisma: PrismaClient | Prisma.TransactionClient,
  vehicleId: string,
  range: TimeRange,
  ignoreBookingId?: string,
) {
  assertValidTimeRange(range);

  const conflict = await prisma.vehicleBooking.findFirst({
    where: {
      id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
      vehicleId,
      status: { in: [...blockingVehicleStatuses] },
      startAt: { lt: range.endAt },
      endAt: { gt: range.startAt },
    },
    select: { id: true },
  });

  return !conflict;
}

export async function isDriverAvailable(
  prisma: PrismaClient | Prisma.TransactionClient,
  driverId: string,
  range: TimeRange,
  ignoreBookingId?: string,
) {
  assertValidTimeRange(range);

  const conflict = await prisma.vehicleBooking.findFirst({
    where: {
      id: ignoreBookingId ? { not: ignoreBookingId } : undefined,
      assignedDriverId: driverId,
      status: { in: [...blockingDriverStatuses] },
      startAt: { lt: range.endAt },
      endAt: { gt: range.startAt },
    },
    select: { id: true },
  });

  return !conflict;
}

export async function getAvailableMappedDrivers(
  prisma: PrismaClient | Prisma.TransactionClient,
  vehicleId: string,
  range: TimeRange,
) {
  assertValidTimeRange(range);

  const mappings = await prisma.driverVehicleMapping.findMany({
    where: {
      vehicleId,
      driver: {
        isActive: true,
        deletedAt: null,
      },
    },
    include: { driver: true },
    orderBy: { driver: { name: "asc" } },
  });

  const availability = await Promise.all(
    mappings.map(async (mapping) => ({
      driver: mapping.driver,
      available: await isDriverAvailable(prisma, mapping.driverId, range),
    })),
  );

  return availability.filter((item) => item.available).map((item) => item.driver);
}
