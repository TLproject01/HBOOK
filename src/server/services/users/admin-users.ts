import type { Prisma, UserRole } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type CreateUserInput = {
  employeeCode: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  departmentId: string;
  initialPassword: string;
};

export async function createUserWithSupabaseAuth(input: CreateUserInput) {
  const supabase = createSupabaseAdminClient();
  const prisma = getPrisma();

  const { data, error } = await supabase.auth.admin.createUser({
    email: input.email,
    password: input.initialPassword,
    email_confirm: true,
    app_metadata: {
      role: input.role,
    },
    user_metadata: {
      name: input.name,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Unable to create Supabase auth user.");
  }

  try {
    return await prisma.user.create({
      data: {
        id: data.user.id,
        employeeCode: input.employeeCode,
        name: input.name,
        username: input.username,
        email: input.email,
        phone: input.phone,
        role: input.role,
        departmentId: input.departmentId,
        mustChangePassword: true,
      },
    });
  } catch (profileError) {
    await supabase.auth.admin.deleteUser(data.user.id);
    throw profileError;
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = createSupabaseAdminClient();
  const prisma = getPrisma();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { mustChangePassword: true },
  });
}

export async function updateProfileRole(userId: string, role: UserRole) {
  const supabase = createSupabaseAdminClient();
  const prisma = getPrisma();

  const existingProfile = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true },
  });

  const profile = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role },
  });

  if (error) {
    await prisma.user.update({
      where: { id: userId },
      data: { role: existingProfile.role },
    });
    throw new Error(error.message);
  }

  return profile;
}

export type ProfileCreateData = Prisma.UserCreateInput;
