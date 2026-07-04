import { describe, expect, it } from "vitest";

import { updateDepartment } from "@/server/services/admin/departments";

describe("admin department service", () => {
  it("updates department name and writes audit log", async () => {
    const writes: Array<{ type: string; data: unknown }> = [];
    const prisma = {
      department: {
        findUniqueOrThrow: async () => ({ id: "dept-1", name: "Old name" }),
        update: async ({ data }: { data: { name: string } }) => {
          writes.push({ type: "department.update", data });
          return { id: "dept-1", name: data.name };
        },
      },
      auditLog: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          writes.push({ type: "auditLog.create", data });
          return data;
        },
      },
    };

    const result = await updateDepartment({
      actorUserId: "admin-1",
      id: "dept-1",
      name: "New name",
      prisma,
    });

    expect(result.name).toBe("New name");
    expect(writes).toContainEqual({
      type: "department.update",
      data: { name: "New name" },
    });
    expect(writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "DEPARTMENT_UPDATED",
        actorUserId: "admin-1",
        entityId: "dept-1",
      }),
    });
  });
});
