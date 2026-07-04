import { ModuleName, UserRole } from "@prisma/client";

type UserProfileRecord = {
  departmentId: string;
  email: string | null;
  employeeCode: string;
  id: string;
  name: string;
  phone: string | null;
  role: UserRole;
  username: string;
};

export type UserProfilePrisma = {
  user: {
    findUniqueOrThrow: (args: unknown) => Promise<UserProfileRecord>;
    update: (args: { where: { id: string }; data: Omit<UserProfileRecord, "id" | "role"> }) => Promise<UserProfileRecord>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type UpdateUserProfileInput = Omit<UserProfileRecord, "role"> & {
  actorUserId: string;
  prisma: UserProfilePrisma;
};

export async function updateUserProfile(input: UpdateUserProfileInput) {
  const current = await input.prisma.user.findUniqueOrThrow({
    where: { id: input.id },
  });
  const data = {
    departmentId: input.departmentId,
    email: input.email,
    employeeCode: input.employeeCode,
    name: input.name,
    phone: input.phone,
    username: input.username,
  };
  const user = await input.prisma.user.update({
    where: { id: input.id },
    data,
  });

  await input.prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "USER_PROFILE_UPDATED",
      module: ModuleName.USER,
      entityType: "profile",
      entityId: user.id,
      oldValues: {
        departmentId: current.departmentId,
        email: current.email,
        employeeCode: current.employeeCode,
        name: current.name,
        phone: current.phone,
        username: current.username,
      },
      newValues: data,
    },
  });

  return user;
}
