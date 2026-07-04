import { NextRequest } from "next/server";

import { requireAdminUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { buildBookingReportWorkbook } from "@/server/services/reports/workbook";

export async function GET(request: NextRequest) {
  await requireAdminUser();
  const prisma = getPrisma();
  const { startAt, endAt } = parseDateRange(request);
  const dateWhere = {
    gte: startAt,
    lte: endAt,
  };

  const [vehicleBookings, roomBookings, auditLogs] = await Promise.all([
    prisma.vehicleBooking.findMany({
      where: { startAt: dateWhere },
      orderBy: { startAt: "asc" },
    }),
    prisma.roomBooking.findMany({
      where: { startAt: dateWhere },
      orderBy: { startAt: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { createdAt: dateWhere },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const workbook = await buildBookingReportWorkbook({
    vehicleBookings: vehicleBookings.map((booking) => ({
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      departmentName: booking.departmentNameSnapshot,
      driverName: booking.driverNameSnapshot,
      endAt: booking.endAt,
      requesterName: booking.requesterNameSnapshot,
      startAt: booking.startAt,
      status: booking.status,
      tripPurpose: booking.tripPurpose,
      vehicleLicensePlate: booking.vehicleLicensePlateSnapshot,
    })),
    roomBookings: roomBookings.map((booking) => ({
      contactName: booking.contactName,
      contactPhone: booking.contactPhone,
      departmentName: booking.departmentNameSnapshot,
      endAt: booking.endAt,
      meetingTitle: booking.meetingTitle,
      requesterName: booking.requesterNameSnapshot,
      roomName: booking.roomNameSnapshot,
      startAt: booking.startAt,
      status: booking.status,
    })),
    auditLogs: auditLogs.map((log) => ({
      action: log.action,
      actorName: log.actor?.name ?? null,
      createdAt: log.createdAt,
      entityType: log.entityType,
      module: log.module,
    })),
  });
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Disposition": 'attachment; filename="booking-report.xlsx"',
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}

function parseDateRange(request: NextRequest) {
  const startDate = request.nextUrl.searchParams.get("startDate");
  const endDate = request.nextUrl.searchParams.get("endDate");
  const startAt = startDate ? new Date(`${startDate}T00:00:00.000Z`) : new Date(0);
  const endAt = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date("9999-12-31T23:59:59.999Z");

  return { startAt, endAt };
}
