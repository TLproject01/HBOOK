import type { UserRole } from "@prisma/client";

export const permissions = {
  USER: [
    "auth.changePassword",
    "vehicle.calendar.view",
    "vehicle.request.create",
    "vehicle.request.manageOwnPending",
    "room.calendar.view",
    "room.booking.create",
    "room.booking.cancelOwnFuture",
    "notification.viewOwn",
  ],
  ADMIN: [
    "admin.dashboard.view",
    "admin.masterData.manage",
    "admin.user.resetPassword",
    "admin.vehicleRequest.review",
    "admin.booking.moveFuture",
    "admin.booking.cancelFuture",
    "admin.report.export",
    "admin.auditLog.view",
    "notification.viewOwn",
  ],
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions][number];

export function hasPermission(role: UserRole, permission: Permission) {
  return permissions[role].includes(permission as never);
}

export function assertPermission(role: UserRole, permission: Permission) {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}
