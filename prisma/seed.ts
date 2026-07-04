import { PrismaClient, UserRole, DriverOption } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminDepartment = await prisma.department.upsert({
    where: { name: "Administration" },
    update: {},
    create: { name: "Administration" },
  });

  const operationsDepartment = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {},
    create: { name: "Operations" },
  });

  await prisma.user.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000001",
      employeeCode: "ADMIN001",
      name: "System Admin",
      username: "admin",
      email: "admin@example.com",
      role: UserRole.ADMIN,
      departmentId: adminDepartment.id,
      mustChangePassword: true,
    },
  });

  await prisma.user.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-4000-8000-000000000002",
      employeeCode: "USER001",
      name: "Demo User",
      username: "user",
      email: "user@example.com",
      role: UserRole.USER,
      departmentId: operationsDepartment.id,
      mustChangePassword: true,
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { licensePlate: "ABC-1001" },
    update: {},
    create: {
      model: "Toyota Commuter",
      color: "White",
      licensePlate: "ABC-1001",
      seatCapacity: 10,
      driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      name: "Demo Driver",
      phone: "0800000000",
    },
  });

  await prisma.driverVehicleMapping.upsert({
    where: {
      driverId_vehicleId: {
        driverId: driver.id,
        vehicleId: vehicle.id,
      },
    },
    update: {},
    create: {
      driverId: driver.id,
      vehicleId: vehicle.id,
    },
  });

  await prisma.meetingRoom.upsert({
    where: { name: "Conference Room A" },
    update: {},
    create: {
      name: "Conference Room A",
      seatCapacity: 12,
      hasTv: true,
      hasConferenceSet: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
