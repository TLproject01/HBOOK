import { z } from "zod";
import { RecurrenceType } from "@prisma/client";

export const createRoomBookingSchema = z
  .object({
    roomId: z.string().min(1, "Meeting room is required."),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    meetingTitle: z.string().trim().min(2, "Meeting title is required."),
    contactName: z.string().trim().min(2, "Contact name is required."),
    contactPhone: z.string().trim().min(5, "Contact phone is required."),
    recurrenceType: z.nativeEnum(RecurrenceType).optional(),
    occurrenceCount: z.coerce.number().int().min(1).max(24).optional(),
  })
  .superRefine((value, context) => {
    if (value.startAt < new Date()) {
      context.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Start datetime must not be in the past.",
      });
    }

    if (value.endAt <= value.startAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End datetime must be after start datetime.",
      });
    }
  });

export const cancelRoomBookingSchema = z.object({
  id: z.string().min(1, "Missing booking id."),
  cancelReason: z.string().trim().min(2, "Cancel reason is required."),
});

export const moveRoomBookingSchema = z
  .object({
    id: z.string().min(1, "Missing booking id."),
    roomId: z.string().min(1, "Meeting room is required."),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
  })
  .superRefine((value, context) => {
    if (value.startAt < new Date()) {
      context.addIssue({
        code: "custom",
        path: ["startAt"],
        message: "Start datetime must not be in the past.",
      });
    }

    if (value.endAt <= value.startAt) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End datetime must be after start datetime.",
      });
    }
  });
