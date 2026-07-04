import { DriverOption, ModuleName } from "@prisma/client";

type VehicleRecord = {
  color: string;
  driverOption: DriverOption;
  id: string;
  licensePlate: string;
  model: string;
  photoUrl: string | null;
  seatCapacity: number;
};

export type VehiclePrisma = {
  vehicle: {
    findUniqueOrThrow: (args: unknown) => Promise<VehicleRecord>;
    update: (args: { where: { id: string }; data: Omit<VehicleRecord, "id"> }) => Promise<VehicleRecord>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type UpdateVehicleInput = Omit<VehicleRecord, "id"> & {
  actorUserId: string;
  id: string;
  prisma: VehiclePrisma;
};

export async function updateVehicle(input: UpdateVehicleInput) {
  const current = await input.prisma.vehicle.findUniqueOrThrow({
    where: { id: input.id },
  });
  const data = {
    color: input.color,
    driverOption: input.driverOption,
    licensePlate: input.licensePlate,
    model: input.model,
    photoUrl: input.photoUrl,
    seatCapacity: input.seatCapacity,
  };
  const vehicle = await input.prisma.vehicle.update({
    where: { id: input.id },
    data,
  });

  await input.prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "VEHICLE_UPDATED",
      module: ModuleName.VEHICLE,
      entityType: "vehicle",
      entityId: vehicle.id,
      oldValues: {
        color: current.color,
        driverOption: current.driverOption,
        licensePlate: current.licensePlate,
        model: current.model,
        photoUrl: current.photoUrl,
        seatCapacity: current.seatCapacity,
      },
      newValues: data,
    },
  });

  return vehicle;
}
