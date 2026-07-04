"use server";

import { revalidatePath } from "next/cache";
import { ModuleName, VehicleBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getPrisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications/notifications";
import { cancelVehicleBookingSchema } from "@/lib/validation/vehicle-booking";

export async function cancelPendingVehicleBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = cancelVehicleBookingSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();

  await prisma.$transaction(async (tx) => {
    const booking = await tx.vehicleBooking.findFirstOrThrow({
      where: {
        id: parsed.id,
        requesterUserId: user.id,
        status: VehicleBookingStatus.PENDING,
      },
    });

    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        status: VehicleBookingStatus.CANCELLED,
        cancelledByUserId: user.id,
        cancelledAt: new Date(),
        cancelledReason: "ผู้ขอยกเลิกก่อนการพิจารณา",
      },
    });

    const admins = await tx.user.findMany({
      where: {
        role: "ADMIN",
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        createNotification(tx, {
          recipientUserId: admin.id,
          title: "คำขอใช้รถถูกยกเลิก",
          message: `${user.name} ยกเลิกคำขอใช้รถที่รออนุมัติ`,
          module: ModuleName.VEHICLE_BOOKING,
          entityType: "vehicle_booking",
          entityId: updated.id,
        }),
      ),
    );

    await writeAuditLog(tx, {
      actorUserId: user.id,
      action: "VEHICLE_REQUEST_CANCELLED",
      module: ModuleName.VEHICLE_BOOKING,
      entityType: "vehicle_booking",
      entityId: updated.id,
      oldValues: { status: booking.status },
      newValues: { status: updated.status },
    });
  });

  revalidatePath("/vehicles/calendar");
  revalidatePath("/vehicles/requests");
}
