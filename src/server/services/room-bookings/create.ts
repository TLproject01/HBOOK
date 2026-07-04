import { ModuleName, RecurrenceType, RoomBookingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { isRoomAvailable as defaultIsRoomAvailable } from "@/lib/availability/room";
import { buildRoomBookingOccurrences } from "./recurrence";

type CreateRoomBookingTransaction = {
  meetingRoom: {
    findFirstOrThrow: (args: unknown) => Promise<RoomForBooking>;
  };
  roomBooking: {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string; status: RoomBookingStatus }>;
  };
  recurringSeries: {
    create: (args: { data: Record<string, unknown> }) => Promise<{ id: string }>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type CreateRoomBookingPrisma = {
  $transaction: <T>(
    callback: (transaction: CreateRoomBookingTransaction) => Promise<T>,
  ) => Promise<T>;
};

type RoomForBooking = {
  id: string;
  hasConferenceSet: boolean;
  hasTv: boolean;
  name: string;
  seatCapacity: number;
};

export type CreateRoomBookingInput = {
  contactName: string;
  contactPhone: string;
  endAt: Date;
  meetingTitle: string;
  occurrenceCount?: number;
  recurrenceType?: RecurrenceType;
  roomId: string;
  startAt: Date;
  user: {
    id: string;
    name: string;
    department: { name: string };
  };
};

type AvailabilityCheck = (
  prisma: CreateRoomBookingTransaction,
  roomId: string,
  range: { startAt: Date; endAt: Date },
) => Promise<boolean>;

export type CreateRoomBookingDependencies = {
  input: CreateRoomBookingInput;
  isRoomAvailable?: AvailabilityCheck;
  prisma: CreateRoomBookingPrisma;
};

export async function createRoomBooking(dependencies: CreateRoomBookingDependencies) {
  const { input } = dependencies;
  const checkRoomAvailable =
    dependencies.isRoomAvailable ??
    ((prisma, roomId, range) =>
      defaultIsRoomAvailable(prisma as unknown as Prisma.TransactionClient, roomId, range));

  return dependencies.prisma.$transaction(async (tx) => {
    const room = await tx.meetingRoom.findFirstOrThrow({
      where: {
        id: input.roomId,
        isActive: true,
        deletedAt: null,
      },
    });

    const occurrences = input.recurrenceType
      ? buildRoomBookingOccurrences({
          endAt: input.endAt,
          occurrenceCount: input.occurrenceCount ?? 1,
          recurrenceType: input.recurrenceType,
          startAt: input.startAt,
        })
      : [{ startAt: input.startAt, endAt: input.endAt }];

    const availability = await Promise.all(
      occurrences.map((occurrence) => checkRoomAvailable(tx, room.id, occurrence)),
    );

    if (availability.some((available) => !available)) {
      throw new Error(
        input.recurrenceType
          ? "ห้องประชุมไม่ว่างในบางรอบที่เลือก"
          : "ห้องประชุมไม่ว่างในช่วงเวลาที่เลือก",
      );
    }

    const series = input.recurrenceType
      ? await tx.recurringSeries.create({
          data: {
            createdByUserId: input.user.id,
            module: "meeting_room",
            occurrenceCount: occurrences.length,
            recurrenceType: input.recurrenceType,
            requesterUserId: input.user.id,
          },
        })
      : null;

    const bookings = [];

    for (const occurrence of occurrences) {
      bookings.push(
        await tx.roomBooking.create({
          data: {
            contactName: input.contactName,
            contactPhone: input.contactPhone,
            createdByUserId: input.user.id,
            departmentNameSnapshot: input.user.department.name,
            endAt: occurrence.endAt,
            meetingTitle: input.meetingTitle,
            recurringSeriesId: series?.id ?? null,
            requesterNameSnapshot: input.user.name,
            requesterUserId: input.user.id,
            roomCapacitySnapshot: room.seatCapacity,
            roomHasConferenceSetSnapshot: room.hasConferenceSet,
            roomHasTvSnapshot: room.hasTv,
            roomId: room.id,
            roomNameSnapshot: room.name,
            startAt: occurrence.startAt,
            status: RoomBookingStatus.APPROVED,
          },
        }),
      );
    }

    await tx.auditLog.create({
      data: {
        actorUserId: input.user.id,
        action: input.recurrenceType ? "ROOM_BOOKING_SERIES_CREATED" : "ROOM_BOOKING_CREATED",
        module: ModuleName.ROOM_BOOKING,
        entityType: input.recurrenceType ? "recurring_series" : "room_booking",
        entityId: series?.id ?? bookings[0].id,
        newValues: {
          occurrenceCount: occurrences.length,
          recurrenceType: input.recurrenceType ?? null,
          roomId: room.id,
          status: RoomBookingStatus.APPROVED,
        },
      },
    });

    return series ?? bookings[0];
  });
}
