import { z } from "zod";

export const cuidSchema = z.string().min(1);

export const futureDateRangeSchema = z
  .object({
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

export const optionalCheckboxSchema = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.boolean(), z.null()])
  .optional()
  .transform((value) => value === "on" || value === "true" || value === true);
