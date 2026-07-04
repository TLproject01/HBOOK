import { z } from "zod";

import { optionalCheckboxSchema } from "./common";

export const createVehicleBookingSchema = z
  .object({
    vehicleId: z.string().min(1, "กรุณาเลือกรถ"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    passengerCount: z.coerce.number().int().positive("จำนวนผู้โดยสารต้องมากกว่า 0"),
    needDriver: optionalCheckboxSchema,
    startLocation: z.string().trim().min(2, "กรุณาระบุจุดเริ่มต้น"),
    destinations: z
      .array(z.string().trim().min(1))
      .min(1, "กรุณาระบุปลายทางอย่างน้อย 1 รายการ"),
    tripPurpose: z.string().trim().min(2, "กรุณาระบุวัตถุประสงค์การเดินทาง"),
    contactName: z.string().trim().min(2, "กรุณาระบุชื่อผู้ประสานงาน"),
    contactPhone: z.string().trim().min(5, "กรุณาระบุเบอร์ติดต่อ"),
  })
  .superRefine((value, context) => {
    if (value.startAt < new Date()) {
      context.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "เวลาเริ่มต้นต้องไม่เป็นอดีต",
      });
    }

    if (value.endAt <= value.startAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
      });
    }
  });

export const cancelVehicleBookingSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
});

export const updateVehicleBookingSchema = createVehicleBookingSchema.extend({
  id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
});

const optionalSelectIdSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().min(1).optional(),
);

export const approveVehicleBookingSchema = z.object({
  id: z.string().min(1, "Missing booking id."),
  assignedDriverId: optionalSelectIdSchema,
});

export const rejectVehicleBookingSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
  rejectReason: z.string().trim().min(2, "กรุณาระบุเหตุผลที่ไม่อนุมัติ"),
});

export const adminCancelVehicleBookingSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
  cancelReason: z.string().trim().min(2, "กรุณาระบุเหตุผลที่ยกเลิก"),
});

export const adminMoveVehicleBookingSchema = z
  .object({
    id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
    vehicleId: z.string().min(1, "กรุณาเลือกรถ"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    passengerCount: z.coerce.number().int().positive("จำนวนผู้โดยสารต้องมากกว่า 0"),
    assignedDriverId: optionalSelectIdSchema,
  })
  .superRefine((value, context) => {
    if (value.startAt < new Date()) {
      context.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "เวลาเริ่มต้นต้องไม่เป็นอดีต",
      });
    }

    if (value.endAt <= value.startAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
      });
    }
  });
