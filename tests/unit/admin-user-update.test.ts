import { describe, expect, it } from "vitest";
import { UserRole } from "@prisma/client";

import { updateUserProfile } from "@/server/services/admin/users";

describe("admin user profile service", () => {
  it("updates user profile details and department, then writes audit log", async () => {
    const writes: Array<{ type: string; data: unknown }> = [];
    const prisma = {
      user: {
        findUniqueOrThrow: async () => ({
          id: "user-1",
          employeeCode: "E001",
          name: "Old",
          username: "old",
          email: "old@example.com",
          phone: null,
          departmentId: "dept-old",
          role: UserRole.USER,
        }),
        update: async ({ data }: { data: {
          departmentId: string;
          email: string | null;
          employeeCode: string;
          name: string;
          phone: string | null;
          username: string;
        } }) => {
          writes.push({ type: "user.update", data });
          return { id: "user-1", role: UserRole.USER, ...data };
        },
      },
      auditLog: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          writes.push({ type: "auditLog.create", data });
          return data;
        },
      },
    };

    const result = await updateUserProfile({
      actorUserId: "admin-1",
      departmentId: "dept-new",
      email: "new@example.com",
      employeeCode: "E002",
      id: "user-1",
      name: "New",
      phone: "0812345678",
      prisma,
      username: "new",
    });

    expect(result.name).toBe("New");
    expect(writes).toContainEqual({
      type: "user.update",
      data: {
        departmentId: "dept-new",
        email: "new@example.com",
        employeeCode: "E002",
        name: "New",
        phone: "0812345678",
        username: "new",
      },
    });
    expect(writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "USER_PROFILE_UPDATED",
        actorUserId: "admin-1",
        entityId: "user-1",
      }),
    });
  });
});
