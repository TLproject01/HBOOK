"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

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
  let profile;

  try {
    profile = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
        isActive: true,
        deletedAt: null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      redirect("/login?error=database");
    }

    throw error;
  }

  if (!profile?.email) {
    redirect("/login?error=invalid-credentials");
  }

  let signInError = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: parsed.data.password,
    });

    signInError = error;
  } catch {
    redirect("/login?error=auth-service");
  }

  if (signInError) {
    redirect("/login?error=invalid-credentials");
  }

  if (profile.mustChangePassword) {
    redirect("/change-password");
  }

  redirect("/dashboard");
}
