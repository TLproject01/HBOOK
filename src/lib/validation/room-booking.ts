import { z } from "zod";
import { RecurrenceType } from "@prisma/client";

export const createRoomBookingSchema = z
  .object({
    roomId: z.string().min(1, "กรุณาเลือกห้องประชุม"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    meetingTitle: z.string().trim().min(2, "กรุณาระบุหัวข้อประชุม"),
    contactName: z.string().trim().min(2, "กรุณาระบุชื่อผู้ประสานงาน"),
    contactPhone: z.string().trim().min(5, "กรุณาระบุเบอร์ติดต่อ"),
    recurrenceType: z.nativeEnum(RecurrenceType).optional(),
    occurrenceCount: z.coerce.number().int().min(1).max(24).optional(),
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

export const cancelRoomBookingSchema = z.object({
  id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
  cancelReason: z.string().trim().min(2, "กรุณาระบุเหตุผลที่ยกเลิก"),
});

export const moveRoomBookingSchema = z
  .object({
    id: z.string().min(1, "ไม่พบรหัสรายการจอง"),
    roomId: z.string().min(1, "กรุณาเลือกห้องประชุม"),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
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
