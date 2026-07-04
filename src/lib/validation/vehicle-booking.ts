import { z } from "zod";

import { optionalCheckboxSchema } from "./common";

export const createVehicleBookingSchema = z
  .object({
    vehicleId: z.string().min(1, "Vehicle is required."),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    passengerCount: z.coerce.number().int().positive("Passenger count must be positive."),
    needDriver: optionalCheckboxSchema,
    startLocation: z.string().trim().min(2, "Start location is required."),
    destinations: z
      .array(z.string().trim().min(1))
      .min(1, "At least one destination is required."),
    tripPurpose: z.string().trim().min(2, "Trip purpose is required."),
    contactName: z.string().trim().min(2, "Contact name is required."),
    contactPhone: z.string().trim().min(5, "Contact phone is required."),
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

export const cancelVehicleBookingSchema = z.object({
  id: z.string().min(1, "Missing booking id."),
});

export const updateVehicleBookingSchema = createVehicleBookingSchema.extend({
  id: z.string().min(1, "Missing booking id."),
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
  id: z.string().min(1, "Missing booking id."),
  rejectReason: z.string().trim().min(2, "Reject reason is required."),
});

export const adminCancelVehicleBookingSchema = z.object({
  id: z.string().min(1, "Missing booking id."),
  cancelReason: z.string().trim().min(2, "Cancel reason is required."),
});

export const adminMoveVehicleBookingSchema = z
  .object({
    id: z.string().min(1, "Missing booking id."),
    vehicleId: z.string().min(1, "Vehicle is required."),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    passengerCount: z.coerce.number().int().positive("Passenger count must be positive."),
    assignedDriverId: optionalSelectIdSchema,
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
