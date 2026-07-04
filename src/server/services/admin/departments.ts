import { ModuleName } from "@prisma/client";

export type DepartmentPrisma = {
  department: {
    findUniqueOrThrow: (args: unknown) => Promise<{ id: string; name: string }>;
    update: (args: { where: { id: string }; data: { name: string } }) => Promise<{ id: string; name: string }>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type UpdateDepartmentInput = {
  actorUserId: string;
  id: string;
  name: string;
  prisma: DepartmentPrisma;
};

export async function updateDepartment(input: UpdateDepartmentInput) {
  const current = await input.prisma.department.findUniqueOrThrow({
    where: { id: input.id },
  });
  const department = await input.prisma.department.update({
    where: { id: input.id },
    data: { name: input.name },
  });

  await input.prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "DEPARTMENT_UPDATED",
      module: ModuleName.DEPARTMENT,
      entityType: "department",
      entityId: department.id,
      oldValues: { name: current.name },
      newValues: { name: department.name },
    },
  });

  return department;
}
