import { ModuleName } from "@prisma/client";

type MeetingRoomRecord = {
  hasConferenceSet: boolean;
  hasTv: boolean;
  id: string;
  name: string;
  seatCapacity: number;
};

export type MeetingRoomPrisma = {
  meetingRoom: {
    findUniqueOrThrow: (args: unknown) => Promise<MeetingRoomRecord>;
    update: (args: { where: { id: string }; data: Omit<MeetingRoomRecord, "id"> }) => Promise<MeetingRoomRecord>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type UpdateMeetingRoomInput = Omit<MeetingRoomRecord, "id"> & {
  actorUserId: string;
  id: string;
  prisma: MeetingRoomPrisma;
};

export async function updateMeetingRoom(input: UpdateMeetingRoomInput) {
  const current = await input.prisma.meetingRoom.findUniqueOrThrow({
    where: { id: input.id },
  });
  const data = {
    hasConferenceSet: input.hasConferenceSet,
    hasTv: input.hasTv,
    name: input.name,
    seatCapacity: input.seatCapacity,
  };
  const room = await input.prisma.meetingRoom.update({
    where: { id: input.id },
    data,
  });

  await input.prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "MEETING_ROOM_UPDATED",
      module: ModuleName.MEETING_ROOM,
      entityType: "meeting_room",
      entityId: room.id,
      oldValues: {
        hasConferenceSet: current.hasConferenceSet,
        hasTv: current.hasTv,
        name: current.name,
        seatCapacity: current.seatCapacity,
      },
      newValues: data,
    },
  });

  return room;
}
