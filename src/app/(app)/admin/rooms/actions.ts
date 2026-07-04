"use server";

import { revalidatePath } from "next/cache";
import { ModuleName } from "@prisma/client";

import { requireAdminUser } from "@/lib/auth/current-user";
import { writeAuditLog } from "@/lib/audit/audit-log";
import { getPrisma } from "@/lib/db/prisma";
import { createMeetingRoomSchema, idSchema, updateMeetingRoomSchema } from "@/lib/validation/admin";
import {
  updateMeetingRoom,
  type MeetingRoomPrisma,
} from "@/server/services/admin/meeting-rooms";

export async function createMeetingRoomAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = createMeetingRoomSchema.parse({
    name: formData.get("name"),
    seatCapacity: formData.get("seatCapacity"),
    hasTv: formData.has("hasTv"),
    hasConferenceSet: formData.has("hasConferenceSet"),
  });
  const prisma = getPrisma();

  const room = await prisma.meetingRoom.create({
    data: parsed,
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "MEETING_ROOM_CREATED",
    module: ModuleName.MEETING_ROOM,
    entityType: "meeting_room",
    entityId: room.id,
    newValues: {
      name: room.name,
      seatCapacity: room.seatCapacity,
      hasTv: room.hasTv,
      hasConferenceSet: room.hasConferenceSet,
    },
  });

  revalidatePath("/admin/rooms");
}

export async function updateMeetingRoomAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = updateMeetingRoomSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    seatCapacity: formData.get("seatCapacity"),
    hasTv: formData.has("hasTv"),
    hasConferenceSet: formData.has("hasConferenceSet"),
  });

  await updateMeetingRoom({
    actorUserId: actor.id,
    ...parsed,
    prisma: getPrisma() as unknown as MeetingRoomPrisma,
  });

  revalidatePath("/admin/rooms");
}

export async function toggleMeetingRoomStatusAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const current = await prisma.meetingRoom.findUniqueOrThrow({ where: { id: parsed.id } });
  const room = await prisma.meetingRoom.update({
    where: { id: parsed.id },
    data: { isActive: !current.isActive },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: room.isActive ? "MEETING_ROOM_ACTIVATED" : "MEETING_ROOM_DEACTIVATED",
    module: ModuleName.MEETING_ROOM,
    entityType: "meeting_room",
    entityId: room.id,
    oldValues: { isActive: current.isActive },
    newValues: { isActive: room.isActive },
  });

  revalidatePath("/admin/rooms");
}

export async function softDeleteMeetingRoomAction(formData: FormData) {
  const actor = await requireAdminUser();
  const parsed = idSchema.parse({ id: formData.get("id") });
  const prisma = getPrisma();
  const room = await prisma.meetingRoom.update({
    where: { id: parsed.id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  await writeAuditLog(prisma, {
    actorUserId: actor.id,
    action: "MEETING_ROOM_SOFT_DELETED",
    module: ModuleName.MEETING_ROOM,
    entityType: "meeting_room",
    entityId: room.id,
    newValues: { deletedAt: room.deletedAt?.toISOString() },
  });

  revalidatePath("/admin/rooms");
}
