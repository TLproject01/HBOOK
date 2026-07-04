import { describe, expect, it } from "vitest";

import { updateDriver } from "@/server/services/admin/drivers";

describe("admin driver service", () => {
  it("updates driver details, replaces photo when provided, and writes audit log", async () => {
    const writes: Array<{ type: string; data: unknown }> = [];
    const prisma = {
      driver: {
        findUniqueOrThrow: async () => ({
          id: "driver-1",
          name: "Old",
          phone: "0800000000",
          photoUrl: null,
        }),
        update: async ({ data }: { data: { name: string; phone: string; photoUrl: string | null } }) => {
          writes.push({ type: "driver.update", data });
          return { id: "driver-1", ...data };
        },
      },
      auditLog: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          writes.push({ type: "auditLog.create", data });
          return data;
        },
      },
    };

    const result = await updateDriver({
      actorUserId: "admin-1",
      id: "driver-1",
      name: "New",
      phone: "0899999999",
      photoUrl: "drivers/new.webp",
      prisma,
    });

    expect(result.name).toBe("New");
    expect(writes).toContainEqual({
      type: "driver.update",
      data: {
        name: "New",
        phone: "0899999999",
        photoUrl: "drivers/new.webp",
      },
    });
    expect(writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "DRIVER_UPDATED",
        actorUserId: "admin-1",
        entityId: "driver-1",
      }),
    });
  });
});
