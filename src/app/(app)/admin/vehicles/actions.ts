"use server";

import { revalidatePath } from "next/cache";
import { ModuleName } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getOptionalFile } from "@/lib/forms/file";
import { getPrisma } from "@/lib/db/prisma";
import { createVehicleSchema, idSchema, updateVehicleSchema } from "@/lib/validation/admin";
import { updateVehicle, type VehiclePrisma } from "@/server/services/admin/vehicles";
import { uploadImageToStorage } from "@/server/services/uploads/image-storage";

function storageUrl(bucket: string, path: string) {
  return `${bucket}/${path}`;
}

export async function createVehicleAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = createVehicleSchema.parse({
    model: formData.get("model"),
    color: formData.get("color"),
    licensePlate: formData.get("licensePlate"),
    seatCapacity: formData.get("seatCapacity"),
    driverOption: formData.get("driverOption"),
  });
  const photo = getOptionalFile(formData, "photo");
  const uploadedPhoto = photo ? await uploadImageToStorage("vehicles", photo, "vehicles") : null;
  const prisma = getPrisma();

  const vehicle = await prisma.vehicle.create({
    data: {
      ...parsed,
      photoUrl: uploadedPhoto ? storageUrl(uploadedPhoto.bucket, uploadedPhoto.path) : null,
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "VEHICLE_CREATED",
    module: ModuleName.VEHICLE,
    entityType: "vehicle",
    entityId: vehicle.id,
    newValues: {
      model: vehicle.model,
      licensePlate: vehicle.licensePlate,
      seatCapacity: vehicle.seatCapacity,
      driverOption: vehicle.driverOption,
    },
  });

  revalidatePath("/admin/vehicles");
}

export async function updateVehicleAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = updateVehicleSchema.parse({
    id: formData.get("id"),
    model: formData.get("model"),
    color: formData.get("color"),
    licensePlate: formData.get("licensePlate"),
    seatCapacity: formData.get("seatCapacity"),
    driverOption: formData.get("driverOption"),
  });
  const photo = getOptionalFile(formData, "photo");
  const uploadedPhoto = photo ? await uploadImageToStorage("vehicles", photo, "vehicles") : null;
  const prisma = getPrisma();
  const current = await prisma.vehicle.findUniqueOrThrow({ where: { id: parsed.id } });

  await updateVehicle({
    actorUserId: actor.id,
    ...parsed,
    photoUrl: uploadedPhoto ? storageUrl(uploadedPhoto.bucket, uploadedPhoto.path) : current.photoUrl,
    prisma: prisma as unknown as VehiclePrisma,
  });

  revalidatePath("/admin/vehicles");
}

export async function toggleVehicleStatusAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const current = await prisma.vehicle.findUniqueOrThrow({ where: { id: parsed.id } });
  const vehicle = await prisma.vehicle.update({
    where: { id: parsed.id },
    data: { isActive: !current.isActive },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: vehicle.isActive ? "VEHICLE_ACTIVATED" : "VEHICLE_DEACTIVATED",
    module: ModuleName.VEHICLE,
    entityType: "vehicle",
    entityId: vehicle.id,
    oldValues: { isActive: current.isActive },
    newValues: { isActive: vehicle.isActive },
  });

  revalidatePath("/admin/vehicles");
}

export async function softDeleteVehicleAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const vehicle = await prisma.vehicle.update({
    where: { id: parsed.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "VEHICLE_SOFT_DELETED",
    module: ModuleName.VEHICLE,
    entityType: "vehicle",
    entityId: vehicle.id,
    newValues: { deletedAt: vehicle.deletedAt?.toISOString() },
  });

  revalidatePath("/admin/vehicles");
}
