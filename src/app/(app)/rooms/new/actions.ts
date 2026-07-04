"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { createRoomBookingSchema } from "@/lib/validation/room-booking";
import {
  createRoomBooking,
  type CreateRoomBookingPrisma,
} from "@/server/services/room-bookings/create";

export async function createRoomBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = createRoomBookingSchema.parse({
    roomId: formData.get("roomId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    meetingTitle: formData.get("meetingTitle"),
    contactName: formData.get("contactName"),
    contactPhone: formData.get("contactPhone"),
    recurrenceType: formData.get("recurrenceType") || undefined,
    occurrenceCount: formData.get("occurrenceCount") || undefined,
  });

  const booking = await createRoomBooking({
    input: { ...parsed, user },
    prisma: getPrisma() as unknown as CreateRoomBookingPrisma,
  });

  revalidatePath("/rooms/calendar");
  redirect(`/rooms/calendar?created=${booking.id}`);
}
