"use server";

import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation/auth";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid-input");
  }

  const prisma = getPrisma();
  const identifier = parsed.data.identifier;
  const profile = await prisma.user.findFirst({
    where: {
      OR: [{ username: identifier }, { email: identifier }],
      isActive: true,
      deletedAt: null,
    },
  });

  if (!profile?.email) {
    redirect("/login?error=invalid-credentials");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  if (profile.mustChangePassword) {
    redirect("/change-password");
  }

  redirect("/dashboard");
}
