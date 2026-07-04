import { ModuleName } from "@prisma/client";

type DriverRecord = {
  id: string;
  name: string;
  phone: string;
  photoUrl: string | null;
};

export type DriverPrisma = {
  driver: {
    findUniqueOrThrow: (args: unknown) => Promise<DriverRecord>;
    update: (args: { where: { id: string }; data: Omit<DriverRecord, "id"> }) => Promise<DriverRecord>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type UpdateDriverInput = Omit<DriverRecord, "id"> & {
  actorUserId: string;
  id: string;
  prisma: DriverPrisma;
};

export async function updateDriver(input: UpdateDriverInput) {
  const current = await input.prisma.driver.findUniqueOrThrow({
    where: { id: input.id },
  });
  const data = {
    name: input.name,
    phone: input.phone,
    photoUrl: input.photoUrl,
  };
  const driver = await input.prisma.driver.update({
    where: { id: input.id },
    data,
  });

  await input.prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "DRIVER_UPDATED",
      module: ModuleName.DRIVER,
      entityType: "driver",
      entityId: driver.id,
      oldValues: {
        name: current.name,
        phone: current.phone,
        photoUrl: current.photoUrl,
      },
      newValues: data,
    },
  });

  return driver;
}
