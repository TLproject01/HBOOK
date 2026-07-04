import { describe, expect, it } from "vitest";

import { updateMeetingRoom } from "@/server/services/admin/meeting-rooms";

describe("admin meeting room service", () => {
  it("updates meeting room details and writes audit log", async () => {
    const writes: Array<{ type: string; data: unknown }> = [];
    const prisma = {
      meetingRoom: {
        findUniqueOrThrow: async () => ({
          id: "room-1",
          name: "Old",
          seatCapacity: 6,
          hasTv: false,
          hasConferenceSet: false,
        }),
        update: async ({ data }: { data: { hasConferenceSet: boolean; hasTv: boolean; name: string; seatCapacity: number } }) => {
          writes.push({ type: "meetingRoom.update", data });
          return { id: "room-1", ...data };
        },
      },
      auditLog: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          writes.push({ type: "auditLog.create", data });
          return data;
        },
      },
    };

    const result = await updateMeetingRoom({
      actorUserId: "admin-1",
      hasConferenceSet: true,
      hasTv: true,
      id: "room-1",
      name: "New",
      prisma,
      seatCapacity: 12,
    });

    expect(result.name).toBe("New");
    expect(writes).toContainEqual({
      type: "meetingRoom.update",
      data: {
        hasConferenceSet: true,
        hasTv: true,
        name: "New",
        seatCapacity: 12,
      },
    });
    expect(writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "MEETING_ROOM_UPDATED",
        actorUserId: "admin-1",
        entityId: "room-1",
      }),
    });
  });
});
