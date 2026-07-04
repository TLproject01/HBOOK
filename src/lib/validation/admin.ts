import { DriverOption, UserRole } from "@prisma/client";
import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่อหน่วยงาน"),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string().min(1, "ไม่พบรหัสหน่วยงาน"),
});

export const idSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสข้อมูล"),
});

export const createUserSchema = z.object({
  employeeCode: z.string().trim().min(1, "กรุณาระบุรหัสพนักงาน"),
  name: z.string().trim().min(2, "กรุณาระบุชื่อ-นามสกุล"),
  username: z.string().trim().min(2, "กรุณาระบุชื่อผู้ใช้"),
  email: z.string().trim().email("กรุณาระบุอีเมลให้ถูกต้อง"),
  phone: z.string().trim().optional(),
  role: z.nativeEnum(UserRole),
  departmentId: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
  initialPassword: z.string().min(10, "รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร"),
});

export const updateUserProfileSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสผู้ใช้งาน"),
  employeeCode: z.string().trim().min(1, "กรุณาระบุรหัสพนักงาน"),
  name: z.string().trim().min(2, "กรุณาระบุชื่อ-นามสกุล"),
  username: z.string().trim().min(2, "กรุณาระบุชื่อผู้ใช้"),
  email: z.string().trim().email("กรุณาระบุอีเมลให้ถูกต้อง").nullable(),
  phone: z.string().trim().nullable(),
  departmentId: z.string().min(1, "กรุณาเลือกหน่วยงาน"),
});

export const resetPasswordSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสผู้ใช้งาน"),
  newPassword: z.string().min(10, "รหัสผ่านต้องมีอย่างน้อย 10 ตัวอักษร"),
});

export const createVehicleSchema = z.object({
  model: z.string().trim().min(2, "กรุณาระบุรุ่นรถ"),
  color: z.string().trim().min(2, "กรุณาระบุสีรถ"),
  licensePlate: z.string().trim().min(2, "กรุณาระบุทะเบียนรถ"),
  seatCapacity: z.coerce.number().int().positive("จำนวนที่นั่งต้องมากกว่า 0"),
  driverOption: z.nativeEnum(DriverOption),
});

export const updateVehicleSchema = createVehicleSchema.extend({
  id: z.string().min(1, "ไม่พบรหัสรถ"),
});

export const createDriverSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่อคนขับ"),
  phone: z.string().trim().min(5, "กรุณาระบุเบอร์โทร"),
});

export const updateDriverSchema = createDriverSchema.extend({
  id: z.string().min(1, "ไม่พบรหัสคนขับ"),
});

export const createMeetingRoomSchema = z.object({
  name: z.string().trim().min(2, "กรุณาระบุชื่อห้อง"),
  seatCapacity: z.coerce.number().int().positive("จำนวนที่นั่งต้องมากกว่า 0"),
  hasTv: z.coerce.boolean().default(false),
  hasConferenceSet: z.coerce.boolean().default(false),
});

export const updateMeetingRoomSchema = createMeetingRoomSchema.extend({
  id: z.string().min(1, "ไม่พบรหัสห้องประชุม"),
});

export const driverVehicleMappingSchema = z.object({
  driverId: z.string().min(1, "กรุณาเลือกคนขับ"),
  vehicleId: z.string().min(1, "กรุณาเลือกรถ"),
});
