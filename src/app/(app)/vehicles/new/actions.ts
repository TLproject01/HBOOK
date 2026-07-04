"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DriverOption, ModuleName, VehicleBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { isVehicleAvailable } from "@/lib/availability/vehicle";
import { getPrisma } from "@/lib/db/prisma";
import { createNotification } from "@/lib/notifications/notifications";
import { createVehicleBookingSchema } from "@/lib/validation/vehicle-booking";

export async function createVehicleBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const destinations = formData
    .getAll("destinations")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const parsed = createVehicleBookingSchema.parse({
    vehicleId: formData.get("vehicleId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    passengerCount: formData.get("passengerCount"),
    needDriver: formData.get("needDriver"),
    startLocation: formData.get("startLocation"),
    destinations,
    tripPurpose: formData.get("tripPurpose"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
  });
  const prisma = getPrisma();

  const booking = await prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findFirstOrThrow({
      where: {
        id: parsed.vehicleId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (parsed.passengerCount > vehicle.seatCapacity) {
      throw new Error("Passenger count exceeds vehicle seat capacity.");
    }

    if (vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY && parsed.needDriver) {
      throw new Error("This vehicle is self-drive only.");
    }

    const available = await isVehicleAvailable(tx, vehicle.id, {
      startAt: parsed.startAt,
      endAt: parsed.endAt,
    });

    if (!available) {
      throw new Error("Vehicle is unavailable for the selected time range.");
    }

    const created = await tx.vehicleBooking.create({
      data: {
        requesterUserId: user.id,
        createdByUserId: user.id,
        vehicleId: vehicle.id,
        status: VehicleBookingStatus.PENDING,
        startAt: parsed.startAt,
        endAt: parsed.endAt,
        passengerCount: parsed.passengerCount,
        needDriver: parsed.needDriver,
        startLocation: parsed.startLocation,
        tripPurpose: parsed.tripPurpose,
        contactName: parsed.contactName,
        contactPhone: parsed.contactPhone,
        requesterNameSnapshot: user.name,
        departmentNameSnapshot: user.department.name,
        vehicleModelSnapshot: vehicle.model,
        vehicleColorSnapshot: vehicle.color,
        vehicleLicensePlateSnapshot: vehicle.licensePlate,
        routes: {
          create: parsed.destinations.map((destination, index) => ({
            sequence: index + 1,
            destination,
          })),
        },
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
          title: "New vehicle request",
          message: `${user.name} requested ${vehicle.licensePlate}.`,
          module: ModuleName.VEHICLE_BOOKING,
          entityType: "vehicle_booking",
          entityId: created.id,
        }),
      ),
    );

    await writeAuditLog(tx, {
      actorUserId: user.id,
      action: "VEHICLE_REQUEST_CREATED",
      module: ModuleName.VEHICLE_BOOKING,
      entityType: "vehicle_booking",
      entityId: created.id,
      newValues: {
        vehicleId: vehicle.id,
        startAt: parsed.startAt.toISOString(),
        endAt: parsed.endAt.toISOString(),
        status: created.status,
      },
    });

    return created;
  });

  revalidatePath("/vehicles/calendar");
  revalidatePath("/vehicles/requests");
  redirect(`/vehicles/requests?created=${booking.id}`);
}
