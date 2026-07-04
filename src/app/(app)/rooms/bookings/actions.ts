"use server";

import { revalidatePath } from "next/cache";

import { requireAdminUser, requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { cancelRoomBookingSchema, moveRoomBookingSchema } from "@/lib/validation/room-booking";
import {
  cancelOwnRoomBooking,
  cancelRoomBookingByAdmin,
  type RoomCancelPrisma,
} from "@/server/services/room-bookings/cancel";
import {
  moveOwnRoomBooking,
  moveRoomBookingByAdmin,
  type RoomMovePrisma,
} from "@/server/services/room-bookings/move";

export async function cancelOwnRoomBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = cancelRoomBookingSchema.parse({
    id: formData.get("id"),
    cancelReason: formData.get("cancelReason"),
  });

  await cancelOwnRoomBooking({
    bookingId: parsed.id,
    cancelReason: parsed.cancelReason,
    prisma: getPrisma() as unknown as RoomCancelPrisma,
    userId: user.id,
  });

  revalidateRoomBookingPaths();
}

export async function cancelRoomBookingByAdminAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = cancelRoomBookingSchema.parse({
    id: formData.get("id"),
    cancelReason: formData.get("cancelReason"),
  });

  await cancelRoomBookingByAdmin({
    actorUserId: actor.id,
    bookingId: parsed.id,
    cancelReason: parsed.cancelReason,
    prisma: getPrisma() as unknown as RoomCancelPrisma,
  });

  revalidateRoomBookingPaths();
}

export async function moveOwnRoomBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = moveRoomBookingSchema.parse({
    id: formData.get("id"),
    roomId: formData.get("roomId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });

  await moveOwnRoomBooking({
    bookingId: parsed.id,
    endAt: parsed.endAt,
    prisma: getPrisma() as unknown as RoomMovePrisma,
    roomId: parsed.roomId,
    startAt: parsed.startAt,
    userId: user.id,
  });

  revalidateRoomBookingPaths();
}

export async function moveRoomBookingByAdminAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = moveRoomBookingSchema.parse({
    id: formData.get("id"),
    roomId: formData.get("roomId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });

  await moveRoomBookingByAdmin({
    actorUserId: actor.id,
    bookingId: parsed.id,
    endAt: parsed.endAt,
    prisma: getPrisma() as unknown as RoomMovePrisma,
    roomId: parsed.roomId,
    startAt: parsed.startAt,
  });

  revalidateRoomBookingPaths();
}

function revalidateRoomBookingPaths() {
  revalidatePath("/rooms/bookings");
  revalidatePath("/rooms/calendar");
  revalidatePath("/admin/room-bookings");
}
