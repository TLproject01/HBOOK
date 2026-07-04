import { describe, expect, it } from "vitest";

import { buildBookingReportWorkbook } from "@/server/services/reports/workbook";

describe("booking report workbook", () => {
  it("creates vehicle, meeting room, and audit log sheets", async () => {
    const workbook = await buildBookingReportWorkbook({
      auditLogs: [
        {
          action: "VEHICLE_REQUEST_CREATED",
          actorName: "Admin",
          createdAt: new Date("2026-07-03T09:00:00.000Z"),
          entityType: "vehicle_booking",
          module: "VEHICLE_BOOKING",
        },
      ],
      roomBookings: [
        {
          contactName: "Requester",
          contactPhone: "0812345678",
          departmentName: "Operations",
          endAt: new Date("2026-07-04T10:00:00.000Z"),
          meetingTitle: "Planning",
          requesterName: "Requester",
          roomName: "Conference A",
          startAt: new Date("2026-07-04T09:00:00.000Z"),
          status: "APPROVED",
        },
      ],
      vehicleBookings: [
        {
          contactName: "Requester",
          contactPhone: "0812345678",
          departmentName: "Operations",
          driverName: "Driver",
          endAt: new Date("2026-07-04T10:00:00.000Z"),
          requesterName: "Requester",
          startAt: new Date("2026-07-04T09:00:00.000Z"),
          status: "APPROVED",
          tripPurpose: "Site visit",
          vehicleLicensePlate: "CAR-100",
        },
      ],
    });

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Vehicle",
      "Meeting Room",
      "Audit Log",
    ]);
    expect(workbook.getWorksheet("Vehicle")?.rowCount).toBe(2);
    expect(workbook.getWorksheet("Meeting Room")?.rowCount).toBe(2);
    expect(workbook.getWorksheet("Audit Log")?.rowCount).toBe(2);
  });
});
