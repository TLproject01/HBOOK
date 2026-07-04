"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { updateVehicleBookingSchema } from "@/lib/validation/vehicle-booking";
import {
  updateOwnPendingVehicleBooking,
  type EditOwnVehicleBookingPrisma,
} from "@/server/services/vehicle-bookings/edit-own";

export async function updateVehicleBookingAction(formData: FormData) {
  const user = await requireCurrentUser();
  const destinations = formData
    .getAll("destinations")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const parsed = updateVehicleBookingSchema.parse({
    id: formData.get("id"),
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

  await updateOwnPendingVehicleBooking({
    input: {
      ...parsed,
      bookingId: parsed.id,
      user,
    },
    prisma: getPrisma() as unknown as EditOwnVehicleBookingPrisma,
  });

  revalidatePath("/vehicles/calendar");
  revalidatePath("/vehicles/requests");
  redirect("/vehicles/requests?updated=1");
}
