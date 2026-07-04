import ExcelJS from "exceljs";

export type VehicleReportRow = {
  contactName: string;
  contactPhone: string;
  departmentName: string;
  driverName: string | null;
  endAt: Date;
  requesterName: string;
  startAt: Date;
  status: string;
  tripPurpose: string;
  vehicleLicensePlate: string;
};

export type RoomReportRow = {
  contactName: string;
  contactPhone: string;
  departmentName: string;
  endAt: Date;
  meetingTitle: string;
  requesterName: string;
  roomName: string;
  startAt: Date;
  status: string;
};

export type AuditReportRow = {
  action: string;
  actorName: string | null;
  createdAt: Date;
  entityType: string;
  module: string;
};

export type BookingReportWorkbookInput = {
  auditLogs: AuditReportRow[];
  roomBookings: RoomReportRow[];
  vehicleBookings: VehicleReportRow[];
};

export async function buildBookingReportWorkbook(input: BookingReportWorkbookInput) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Booking System";
  workbook.created = new Date();

  addSheet(workbook, "Vehicle", [
    "Status",
    "Start",
    "End",
    "Requester",
    "Department",
    "Vehicle",
    "Driver",
    "Purpose",
    "Contact",
    "Phone",
  ], input.vehicleBookings.map((booking) => [
    booking.status,
    booking.startAt,
    booking.endAt,
    booking.requesterName,
    booking.departmentName,
    booking.vehicleLicensePlate,
    booking.driverName ?? "",
    booking.tripPurpose,
    booking.contactName,
    booking.contactPhone,
  ]));

  addSheet(workbook, "Meeting Room", [
    "Status",
    "Start",
    "End",
    "Requester",
    "Department",
    "Room",
    "Meeting",
    "Contact",
    "Phone",
  ], input.roomBookings.map((booking) => [
    booking.status,
    booking.startAt,
    booking.endAt,
    booking.requesterName,
    booking.departmentName,
    booking.roomName,
    booking.meetingTitle,
    booking.contactName,
    booking.contactPhone,
  ]));

  addSheet(workbook, "Audit Log", [
    "Created",
    "Actor",
    "Module",
    "Action",
    "Entity",
  ], input.auditLogs.map((log) => [
    log.createdAt,
    log.actorName ?? "",
    log.module,
    log.action,
    log.entityType,
  ]));

  return workbook;
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: string[],
  rows: unknown[][],
) {
  const sheet = workbook.addWorksheet(name);
  sheet.addRow(headers);
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((column) => {
    column.width = 20;
  });
}
