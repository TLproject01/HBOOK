import { describe, expect, it } from "vitest";
import { DriverOption } from "@prisma/client";

import { updateVehicle } from "@/server/services/admin/vehicles";

describe("admin vehicle service", () => {
  it("updates vehicle details, replaces photo when provided, and writes audit log", async () => {
    const writes: Array<{ type: string; data: unknown }> = [];
    const prisma = {
      vehicle: {
        findUniqueOrThrow: async () => ({
          id: "vehicle-1",
          model: "Old",
          color: "White",
          licensePlate: "OLD-1",
          seatCapacity: 4,
          driverOption: DriverOption.SELF_DRIVE_ONLY,
          photoUrl: null,
        }),
        update: async ({ data }: { data: {
          color: string;
          driverOption: DriverOption;
          licensePlate: string;
          model: string;
          photoUrl: string | null;
          seatCapacity: number;
        } }) => {
          writes.push({ type: "vehicle.update", data });
          return { id: "vehicle-1", ...data };
        },
      },
      auditLog: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          writes.push({ type: "auditLog.create", data });
          return data;
        },
      },
    };

    const result = await updateVehicle({
      actorUserId: "admin-1",
      color: "Black",
      driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
      id: "vehicle-1",
      licensePlate: "NEW-1",
      model: "New",
      photoUrl: "vehicles/new.webp",
      prisma,
      seatCapacity: 6,
    });

    expect(result.model).toBe("New");
    expect(writes).toContainEqual({
      type: "vehicle.update",
      data: expect.objectContaining({
        color: "Black",
        driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
        licensePlate: "NEW-1",
        model: "New",
        photoUrl: "vehicles/new.webp",
        seatCapacity: 6,
      }),
    });
    expect(writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_UPDATED",
        actorUserId: "admin-1",
        entityId: "vehicle-1",
      }),
    });
  });
});
