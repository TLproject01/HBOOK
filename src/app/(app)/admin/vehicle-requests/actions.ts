"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import {
  adminCancelVehicleBookingSchema,
  adminMoveVehicleBookingSchema,
  approveVehicleBookingSchema,
  rejectVehicleBookingSchema,
} from "@/lib/validation/vehicle-booking";
import {
  cancelVehicleBookingByAdmin,
  type AdminCancelPrisma,
} from "@/server/services/vehicle-bookings/admin-cancel";
import {
  moveVehicleBookingByAdmin,
  type AdminMovePrisma,
} from "@/server/services/vehicle-bookings/admin-move";
import {
  approveVehicleBooking,
  rejectVehicleBooking,
  type ReviewPrisma,
} from "@/server/services/vehicle-bookings/review";

export async function approveVehicleBookingAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = approveVehicleBookingSchema.parse({
    id: formData.get("id"),
    assignedDriverId: formData.get("assignedDriverId"),
  });

  await approveVehicleBooking({
    actorUserId: actor.id,
    assignedDriverId: parsed.assignedDriverId,
    bookingId: parsed.id,
    prisma: getPrisma() as unknown as ReviewPrisma,
  });

  revalidateVehicleBookingPaths();
}

export async function rejectVehicleBookingAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = rejectVehicleBookingSchema.parse({
    id: formData.get("id"),
    rejectReason: formData.get("rejectReason"),
  });

  await rejectVehicleBooking({
    actorUserId: actor.id,
    bookingId: parsed.id,
    prisma: getPrisma() as unknown as ReviewPrisma,
    rejectReason: parsed.rejectReason,
  });

  revalidateVehicleBookingPaths();
}

export async function cancelVehicleBookingByAdminAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = adminCancelVehicleBookingSchema.parse({
    id: formData.get("id"),
    cancelReason: formData.get("cancelReason"),
  });

  await cancelVehicleBookingByAdmin({
    actorUserId: actor.id,
    bookingId: parsed.id,
    cancelReason: parsed.cancelReason,
    prisma: getPrisma() as unknown as AdminCancelPrisma,
  });

  revalidateVehicleBookingPaths();
}

export async function moveVehicleBookingByAdminAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = adminMoveVehicleBookingSchema.parse({
    id: formData.get("id"),
    vehicleId: formData.get("vehicleId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    passengerCount: formData.get("passengerCount"),
    assignedDriverId: formData.get("assignedDriverId"),
  });

  await moveVehicleBookingByAdmin({
    actorUserId: actor.id,
    assignedDriverId: parsed.assignedDriverId,
    bookingId: parsed.id,
    endAt: parsed.endAt,
    passengerCount: parsed.passengerCount,
    prisma: getPrisma() as unknown as AdminMovePrisma,
    startAt: parsed.startAt,
    vehicleId: parsed.vehicleId,
  });

  revalidateVehicleBookingPaths();
}

function revalidateVehicleBookingPaths() {
  revalidatePath("/admin/vehicle-requests");
  revalidatePath("/vehicles/calendar");
  revalidatePath("/vehicles/requests");
}
