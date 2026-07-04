import { DriverOption, UserRole } from "@prisma/client";
import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required."),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, "Missing department id."),
});

export const idSchema = z.object({
  id: z.string().min(1, "Missing id."),
});

export const createUserSchema = z.object({
  employeeCode: z.string().trim().min(1, "Employee code is required."),
  name: z.string().trim().min(2, "Name is required."),
  username: z.string().trim().min(2, "Username is required."),
  email: z.string().trim().email("Use a valid email."),
  phone: z.string().trim().optional(),
  role: z.nativeEnum(UserRole),
  departmentId: z.string().min(1, "Department is required."),
  initialPassword: z.string().min(10, "Use at least 10 characters."),
});

export const updateUserProfileSchema = z.object({
  id: z.string().min(1, "Missing user id."),
  employeeCode: z.string().trim().min(1, "Employee code is required."),
  name: z.string().trim().min(2, "Name is required."),
  username: z.string().trim().min(2, "Username is required."),
  email: z.string().trim().email("Use a valid email.").nullable(),
  phone: z.string().trim().nullable(),
  departmentId: z.string().min(1, "Department is required."),
});

export const resetPasswordSchema = z.object({
  id: z.string().min(1, "Missing user id."),
  newPassword: z.string().min(10, "Use at least 10 characters."),
});

export const createVehicleSchema = z.object({
  model: z.string().trim().min(2, "Vehicle model is required."),
  color: z.string().trim().min(2, "Color is required."),
  licensePlate: z.string().trim().min(2, "License plate is required."),
  seatCapacity: z.coerce.number().int().positive("Seat capacity must be positive."),
  driverOption: z.nativeEnum(DriverOption),
});

export const updateVehicleSchema = createVehicleSchema.extend({
  id: z.string().min(1, "Missing vehicle id."),
});

export const createDriverSchema = z.object({
  name: z.string().trim().min(2, "Driver name is required."),
  phone: z.string().trim().min(5, "Phone number is required."),
});

export const updateDriverSchema = createDriverSchema.extend({
  id: z.string().min(1, "Missing driver id."),
});

export const createMeetingRoomSchema = z.object({
  name: z.string().trim().min(2, "Room name is required."),
  seatCapacity: z.coerce.number().int().positive("Seat capacity must be positive."),
  hasTv: z.coerce.boolean().default(false),
  hasConferenceSet: z.coerce.boolean().default(false),
});

export const updateMeetingRoomSchema = createMeetingRoomSchema.extend({
  id: z.string().min(1, "Missing room id."),
});

export const driverVehicleMappingSchema = z.object({
  driverId: z.string().min(1, "Driver is required."),
  vehicleId: z.string().min(1, "Vehicle is required."),
});
