"use server";

import { revalidatePath } from "next/cache";
import { ModuleName } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getPrisma } from "@/lib/db/prisma";
import { createDepartmentSchema, idSchema, updateDepartmentSchema } from "@/lib/validation/admin";
import { updateDepartment, type DepartmentPrisma } from "@/server/services/admin/departments";

export async function createDepartmentAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = createDepartmentSchema.parse({
    name: formData.get("name"),
  });
  const prisma = getPrisma();

  const department = await prisma.department.create({
    data: { name: parsed.name },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DEPARTMENT_CREATED",
    module: ModuleName.DEPARTMENT,
    entityType: "department",
    entityId: department.id,
    newValues: { name: department.name },
  });

  revalidatePath("/admin/departments");
}

export async function updateDepartmentAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = updateDepartmentSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  await updateDepartment({
    actorUserId: actor.id,
    id: parsed.id,
    name: parsed.name,
    prisma: getPrisma() as unknown as DepartmentPrisma,
  });

  revalidatePath("/admin/departments");
}

export async function toggleDepartmentStatusAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const current = await prisma.department.findUniqueOrThrow({
    where: { id: parsed.id },
  });

  const department = await prisma.department.update({
    where: { id: parsed.id },
    data: { isActive: !current.isActive },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: department.isActive ? "DEPARTMENT_ACTIVATED" : "DEPARTMENT_DEACTIVATED",
    module: ModuleName.DEPARTMENT,
    entityType: "department",
    entityId: department.id,
    oldValues: { isActive: current.isActive },
    newValues: { isActive: department.isActive },
  });

  revalidatePath("/admin/departments");
}

export async function softDeleteDepartmentAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const activeUsers = await prisma.user.count({
    where: {
      departmentId: parsed.id,
      isActive: true,
      deletedAt: null,
    },
  });

  if (activeUsers > 0) {
    throw new Error("Department is still referenced by active users.");
  }

  const department = await prisma.department.update({
    where: { id: parsed.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DEPARTMENT_SOFT_DELETED",
    module: ModuleName.DEPARTMENT,
    entityType: "department",
    entityId: department.id,
    oldValues: { deletedAt: null },
    newValues: { deletedAt: department.deletedAt?.toISOString() },
  });

  revalidatePath("/admin/departments");
}
