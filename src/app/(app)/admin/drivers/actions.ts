"use server";

import { revalidatePath } from "next/cache";
import { ModuleName } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getPrisma } from "@/lib/db/prisma";
import { getOptionalFile } from "@/lib/forms/file";
import {
  createDriverSchema,
  driverVehicleMappingSchema,
  idSchema,
  updateDriverSchema,
} from "@/lib/validation/admin";
import { updateDriver, type DriverPrisma } from "@/server/services/admin/drivers";
import { uploadImageToStorage } from "@/server/services/uploads/image-storage";

function storageUrl(bucket: string, path: string) {
  return `${bucket}/${path}`;
}

export async function createDriverAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = createDriverSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  const photo = getOptionalFile(formData, "photo");
  const uploadedPhoto = photo ? await uploadImageToStorage("drivers", photo, "drivers") : null;
  const prisma = getPrisma();

  const driver = await prisma.driver.create({
    data: {
      ...parsed,
      photoUrl: uploadedPhoto ? storageUrl(uploadedPhoto.bucket, uploadedPhoto.path) : null,
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DRIVER_CREATED",
    module: ModuleName.DRIVER,
    entityType: "driver",
    entityId: driver.id,
    newValues: { name: driver.name, phone: driver.phone },
  });

  revalidatePath("/admin/drivers");
}

export async function updateDriverAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = updateDriverSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  const photo = getOptionalFile(formData, "photo");
  const uploadedPhoto = photo ? await uploadImageToStorage("drivers", photo, "drivers") : null;
  const prisma = getPrisma();
  const current = await prisma.driver.findUniqueOrThrow({ where: { id: parsed.id } });

  await updateDriver({
    actorUserId: actor.id,
    ...parsed,
    photoUrl: uploadedPhoto ? storageUrl(uploadedPhoto.bucket, uploadedPhoto.path) : current.photoUrl,
    prisma: prisma as unknown as DriverPrisma,
  });

  revalidatePath("/admin/drivers");
}

export async function toggleDriverStatusAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const current = await prisma.driver.findUniqueOrThrow({ where: { id: parsed.id } });
  const driver = await prisma.driver.update({
    where: { id: parsed.id },
    data: { isActive: !current.isActive },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: driver.isActive ? "DRIVER_ACTIVATED" : "DRIVER_DEACTIVATED",
    module: ModuleName.DRIVER,
    entityType: "driver",
    entityId: driver.id,
    oldValues: { isActive: current.isActive },
    newValues: { isActive: driver.isActive },
  });

  revalidatePath("/admin/drivers");
}

export async function softDeleteDriverAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const driver = await prisma.driver.update({
    where: { id: parsed.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DRIVER_SOFT_DELETED",
    module: ModuleName.DRIVER,
    entityType: "driver",
    entityId: driver.id,
    newValues: { deletedAt: driver.deletedAt?.toISOString() },
  });

  revalidatePath("/admin/drivers");
}

export async function createDriverVehicleMappingAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = driverVehicleMappingSchema.parse({
    driverId: formData.get("driverId"),
    vehicleId: formData.get("vehicleId"),
  });
  const prisma = getPrisma();

  const mapping = await prisma.driverVehicleMapping.upsert({
    where: {
      driverId_vehicleId: {
        driverId: parsed.driverId,
        vehicleId: parsed.vehicleId,
      },
    },
    update: {},
    create: parsed,
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DRIVER_VEHICLE_MAPPING_CREATED",
    module: ModuleName.DRIVER,
    entityType: "driver_vehicle_mapping",
    entityId: mapping.id,
    newValues: parsed,
  });

  revalidatePath("/admin/drivers");
}

export async function deleteDriverVehicleMappingAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const mapping = await prisma.driverVehicleMapping.delete({
    where: { id: parsed.id },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "DRIVER_VEHICLE_MAPPING_DELETED",
    module: ModuleName.DRIVER,
    entityType: "driver_vehicle_mapping",
    entityId: mapping.id,
    oldValues: { driverId: mapping.driverId, vehicleId: mapping.vehicleId },
  });

  revalidatePath("/admin/drivers");
}
