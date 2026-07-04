"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { markNotificationReadSchema } from "@/lib/validation/notifications";
import { markOwnNotificationRead } from "@/server/services/notifications/read";

export async function markNotificationReadAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = markNotificationReadSchema.parse({ id: formData.get("id") });

  await markOwnNotificationRead({
    notificationId: parsed.id,
    prisma: getPrisma(),
    userId: user.id,
  });

  revalidatePath("/notifications");
}
