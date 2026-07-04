-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "DriverOption" AS ENUM ('SELF_DRIVE_ONLY', 'DRIVER_OR_SELF_DRIVE');

-- CreateEnum
CREATE TYPE "VehicleBookingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoomBookingStatus" AS ENUM ('APPROVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ModuleName" AS ENUM ('AUTH', 'USER', 'DEPARTMENT', 'VEHICLE', 'DRIVER', 'MEETING_ROOM', 'VEHICLE_BOOKING', 'ROOM_BOOKING', 'REPORT');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "employee_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "department_id" TEXT NOT NULL,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "photo_url" TEXT,
    "driver_option" "DriverOption" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "photo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_vehicle_mappings" (
    "id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_vehicle_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "has_tv" BOOLEAN NOT NULL DEFAULT false,
    "has_conference_set" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_bookings" (
    "id" TEXT NOT NULL,
    "requester_user_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "assigned_driver_id" TEXT,
    "status" "VehicleBookingStatus" NOT NULL DEFAULT 'PENDING',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "passenger_count" INTEGER NOT NULL,
    "need_driver" BOOLEAN NOT NULL DEFAULT false,
    "start_location" TEXT NOT NULL,
    "trip_purpose" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "reject_reason" TEXT,
    "cancelled_reason" TEXT,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMP(3),
    "cancelled_by_user_id" UUID,
    "cancelled_at" TIMESTAMP(3),
    "requester_name_snapshot" TEXT NOT NULL,
    "department_name_snapshot" TEXT NOT NULL,
    "vehicle_model_snapshot" TEXT NOT NULL,
    "vehicle_color_snapshot" TEXT NOT NULL,
    "vehicle_license_plate_snapshot" TEXT NOT NULL,
    "driver_name_snapshot" TEXT,
    "driver_phone_snapshot" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_booking_routes" (
    "id" TEXT NOT NULL,
    "vehicle_booking_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "destination" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_booking_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_series" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT 'meeting_room',
    "recurrence_type" "RecurrenceType" NOT NULL,
    "occurrence_count" INTEGER NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "requester_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recurring_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_bookings" (
    "id" TEXT NOT NULL,
    "requester_user_id" UUID NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "room_id" TEXT NOT NULL,
    "recurring_series_id" TEXT,
    "status" "RoomBookingStatus" NOT NULL DEFAULT 'APPROVED',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "meeting_title" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "cancelled_by_user_id" UUID,
    "cancelled_at" TIMESTAMP(3),
    "cancelled_reason" TEXT,
    "requester_name_snapshot" TEXT NOT NULL,
    "department_name_snapshot" TEXT NOT NULL,
    "room_name_snapshot" TEXT NOT NULL,
    "room_capacity_snapshot" INTEGER NOT NULL,
    "room_has_tv_snapshot" BOOLEAN NOT NULL,
    "room_has_conference_set_snapshot" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "module" "ModuleName" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "module" "ModuleName" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_employee_code_key" ON "profiles"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE INDEX "profiles_department_id_idx" ON "profiles"("department_id");

-- CreateIndex
CREATE INDEX "profiles_role_idx" ON "profiles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE INDEX "vehicles_is_active_deleted_at_idx" ON "vehicles"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "drivers_is_active_deleted_at_idx" ON "drivers"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "driver_vehicle_mappings_vehicle_id_idx" ON "driver_vehicle_mappings"("vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_vehicle_mappings_driver_id_vehicle_id_key" ON "driver_vehicle_mappings"("driver_id", "vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rooms_name_key" ON "meeting_rooms"("name");

-- CreateIndex
CREATE INDEX "meeting_rooms_is_active_deleted_at_idx" ON "meeting_rooms"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "vehicle_bookings_vehicle_id_start_at_end_at_status_idx" ON "vehicle_bookings"("vehicle_id", "start_at", "end_at", "status");

-- CreateIndex
CREATE INDEX "vehicle_bookings_assigned_driver_id_start_at_end_at_status_idx" ON "vehicle_bookings"("assigned_driver_id", "start_at", "end_at", "status");

-- CreateIndex
CREATE INDEX "vehicle_bookings_requester_user_id_start_at_idx" ON "vehicle_bookings"("requester_user_id", "start_at");

-- CreateIndex
CREATE INDEX "vehicle_bookings_status_idx" ON "vehicle_bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_booking_routes_vehicle_booking_id_sequence_key" ON "vehicle_booking_routes"("vehicle_booking_id", "sequence");

-- CreateIndex
CREATE INDEX "room_bookings_room_id_start_at_end_at_status_idx" ON "room_bookings"("room_id", "start_at", "end_at", "status");

-- CreateIndex
CREATE INDEX "room_bookings_requester_user_id_start_at_idx" ON "room_bookings"("requester_user_id", "start_at");

-- CreateIndex
CREATE INDEX "room_bookings_recurring_series_id_idx" ON "room_bookings"("recurring_series_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_user_id_is_read_created_at_idx" ON "notifications"("recipient_user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "audit_logs_module_action_idx" ON "audit_logs"("module", "action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_vehicle_mappings" ADD CONSTRAINT "driver_vehicle_mappings_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_vehicle_mappings" ADD CONSTRAINT "driver_vehicle_mappings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_cancelled_by_user_id_fkey" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_bookings" ADD CONSTRAINT "vehicle_bookings_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_booking_routes" ADD CONSTRAINT "vehicle_booking_routes_vehicle_booking_id_fkey" FOREIGN KEY ("vehicle_booking_id") REFERENCES "vehicle_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_series" ADD CONSTRAINT "recurring_series_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recurring_series" ADD CONSTRAINT "recurring_series_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_requester_user_id_fkey" FOREIGN KEY ("requester_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_cancelled_by_user_id_fkey" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "meeting_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_bookings" ADD CONSTRAINT "room_bookings_recurring_series_id_fkey" FOREIGN KEY ("recurring_series_id") REFERENCES "recurring_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
