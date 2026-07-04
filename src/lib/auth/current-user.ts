import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const authUserId = data?.claims?.sub;

  if (error || !authUserId) {
    return null;
  }

  const prisma = getPrisma();
  const profile = await prisma.user.findUnique({
    where: { id: authUserId },
    include: { department: true },
  });

  if (!profile || !profile.isActive || profile.deletedAt) {
    return null;
  }

  return profile;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
