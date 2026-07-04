import { RecurrenceType } from "@prisma/client";

export type BuildRoomBookingOccurrencesInput = {
  endAt: Date;
  occurrenceCount: number;
  recurrenceType: RecurrenceType;
  startAt: Date;
};

export type RoomBookingOccurrence = {
  endAt: Date;
  startAt: Date;
};

export function buildRoomBookingOccurrences(
  input: BuildRoomBookingOccurrencesInput,
): RoomBookingOccurrence[] {
  if (input.occurrenceCount < 1) {
    throw new Error("Occurrence count must be positive.");
  }

  const durationMs = input.endAt.getTime() - input.startAt.getTime();

  return Array.from({ length: input.occurrenceCount }, (_, index) => {
    const startAt = new Date(input.startAt);

    if (input.recurrenceType === RecurrenceType.WEEKLY) {
      startAt.setUTCDate(startAt.getUTCDate() + index * 7);
    } else {
      startAt.setUTCMonth(startAt.getUTCMonth() + index);
    }

    return {
      startAt,
      endAt: new Date(startAt.getTime() + durationMs),
    };
  });
}
