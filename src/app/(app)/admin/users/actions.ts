"use server";

import { revalidatePath } from "next/cache";
import { ModuleName } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getPrisma } from "@/lib/db/prisma";
import {
  createUserSchema,
  idSchema,
  resetPasswordSchema,
  updateUserProfileSchema,
} from "@/lib/validation/admin";
import { updateUserProfile, type UserProfilePrisma } from "@/server/services/admin/users";
import {
  createUserWithSupabaseAuth,
  resetUserPassword,
  updateProfileRole,
} from "@/server/services/users/admin-users";

export async function createUserAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = createUserSchema.parse({
    employeeCode: formData.get("employeeCode"),
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    departmentId: formData.get("departmentId"),
    initialPassword: formData.get("initialPassword"),
  });

  const user = await createUserWithSupabaseAuth(parsed);
  const prisma = getPrisma();

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "USER_CREATED",
    module: ModuleName.USER,
    entityType: "profile",
    entityId: user.id,
    newValues: {
      employeeCode: user.employeeCode,
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    },
  });

  revalidatePath("/admin/users");
}

export async function resetPasswordAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = resetPasswordSchema.parse({
    id: formData.get("id"),
    newPassword: formData.get("newPassword"),
  });

  const user = await resetUserPassword(parsed.id, parsed.newPassword);
  const prisma = getPrisma();

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "USER_PASSWORD_RESET",
    module: ModuleName.USER,
    entityType: "profile",
    entityId: user.id,
    newValues: { mustChangePassword: true },
  });

  revalidatePath("/admin/users");
}

export async function updateUserProfileAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = updateUserProfileSchema.parse({
    id: formData.get("id"),
    employeeCode: formData.get("employeeCode"),
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email") || null,
    phone: formData.get("phone") || null,
    departmentId: formData.get("departmentId"),
  });

  await updateUserProfile({
    actorUserId: actor.id,
    ...parsed,
    prisma: getPrisma() as unknown as UserProfilePrisma,
  });

  revalidatePath("/admin/users");
}

export async function toggleUserStatusAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const current = await prisma.user.findUniqueOrThrow({ where: { id: parsed.id } });

  const user = await prisma.user.update({
    where: { id: parsed.id },
    data: { isActive: !current.isActive },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: user.isActive ? "USER_ACTIVATED" : "USER_DEACTIVATED",
    module: ModuleName.USER,
    entityType: "profile",
    entityId: user.id,
    oldValues: { isActive: current.isActive },
    newValues: { isActive: user.isActive },
  });

  revalidatePath("/admin/users");
}

export async function softDeleteUserAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();

  const user = await prisma.user.update({
    where: { id: parsed.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "USER_SOFT_DELETED",
    module: ModuleName.USER,
    entityType: "profile",
    entityId: user.id,
    newValues: { deletedAt: user.deletedAt?.toISOString() },
  });

  revalidatePath("/admin/users");
}

export async function updateRoleAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const role = createUserSchema.shape.role.parse(formData.get("role"));
  const user = await updateProfileRole(parsed.id, role);
  const prisma = getPrisma();

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "USER_ROLE_UPDATED",
    module: ModuleName.USER,
    entityType: "profile",
    entityId: user.id,
    newValues: { role: user.role },
  });

  revalidatePath("/admin/users");
}
