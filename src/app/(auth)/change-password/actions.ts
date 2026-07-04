"use server";

import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/validation/auth";

export async function changePasswordAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/change-password?error=invalid-input");
  }

  if (!user.email) {
    redirect("/change-password?error=current-password");
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (signInError) {
    redirect("/change-password?error=current-password");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (updateError) {
    redirect("/change-password?error=update-failed");
  }

  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      mustChangePassword: false,
    },
  });

  redirect("/dashboard");
}
