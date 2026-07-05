import { KeyRound, Power, Shield, Trash2, UserPlus } from "lucide-react";
import { UserRole } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";
import {
  createUserAction,
  resetPasswordAction,
  softDeleteUserAction,
  toggleUserStatusAction,
  updateUserProfileAction,
  updateRoleAction,
} from "./actions";

export default async function UsersPage() {
  const prisma = getPrisma();
  const [users, departments] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      include: { department: true },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.department.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sky-700">
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">ผู้ใช้งาน</h1>
        <p className="mt-2 text-sm text-slate-600">
          เพิ่มผู้ใช้งาน กำหนดสิทธิ์ และดูแลข้อมูลติดต่อสำหรับการจอง
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createUserAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <UserPlus aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">เพิ่มผู้ใช้งาน</h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="รหัสพนักงาน" name="employeeCode" />
            <Field label="ชื่อผู้ใช้" name="username" />
            <Field className="sm:col-span-2" label="ชื่อ-นามสกุล" name="name" />
            <Field className="sm:col-span-2" label="อีเมล" name="email" type="email" />
            <Field label="เบอร์โทร" name="phone" required={false} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">สิทธิ์ใช้งาน</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="role"
              >
                <option value={UserRole.USER}>ผู้ใช้งาน</option>
                <option value={UserRole.ADMIN}>ผู้ดูแลระบบ</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">หน่วยงาน</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="departmentId"
                required
              >
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              className="sm:col-span-2"
              label="รหัสผ่านเริ่มต้น"
              name="initialPassword"
              type="password"
            />
          </div>

          <button
            className="mt-5 w-full rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            เพิ่มผู้ใช้งาน
          </button>
        </form>

        <div className="space-y-4">
          {users.map((user) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={user.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">{user.name}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {user.role === UserRole.ADMIN ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {user.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                    </span>
                    {user.mustChangePassword ? (
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                        ต้องเปลี่ยนรหัสผ่าน
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {user.employeeCode} · {user.email} · {user.department.name}
                  </p>
                </div>

                <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                  <form action={updateRoleAction} className="flex gap-2">
                    <input name="id" type="hidden" value={user.id} />
                    <select
                      className="h-9 rounded-md border border-slate-300 px-2 text-sm"
                      defaultValue={user.role}
                      name="role"
                    >
                      <option value={UserRole.USER}>ผู้ใช้งาน</option>
                      <option value={UserRole.ADMIN}>ผู้ดูแลระบบ</option>
                    </select>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title="บันทึกสิทธิ์"
                      type="submit"
                    >
                      <Shield aria-hidden className="h-4 w-4" />
                    </button>
                  </form>

                  <form action={resetPasswordAction} className="flex gap-2">
                    <input name="id" type="hidden" value={user.id} />
                    <input
                      className="h-9 w-36 rounded-md border border-slate-300 px-2 text-sm"
                      name="newPassword"
                      placeholder="รหัสผ่านใหม่"
                      type="password"
                    />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title="รีเซ็ตรหัสผ่าน"
                      type="submit"
                    >
                      <KeyRound aria-hidden className="h-4 w-4" />
                    </button>
                  </form>

                  <form action={toggleUserStatusAction}>
                    <input name="id" type="hidden" value={user.id} />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title={user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      type="submit"
                    >
                      <Power aria-hidden className="h-4 w-4" />
                    </button>
                  </form>

                  <form action={softDeleteUserAction}>
                    <input name="id" type="hidden" value={user.id} />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700"
                      title="ลบผู้ใช้งาน"
                      type="submit"
                    >
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
              <form
                action={updateUserProfileAction}
                className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
              >
                <input name="id" type="hidden" value={user.id} />
                <Field defaultValue={user.employeeCode} label="รหัสพนักงาน" name="employeeCode" />
                <Field defaultValue={user.username} label="ชื่อผู้ใช้" name="username" />
                <Field
                  className="sm:col-span-2"
                  defaultValue={user.name}
                  label="ชื่อ-นามสกุล"
                  name="name"
                />
                <Field
                  className="sm:col-span-2"
                  defaultValue={user.email ?? ""}
                  label="อีเมล"
                  name="email"
                  type="email"
                />
                <Field
                  defaultValue={user.phone ?? ""}
                  label="เบอร์โทร"
                  name="phone"
                  required={false}
                />
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">หน่วยงาน</span>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                    defaultValue={user.departmentId}
                    name="departmentId"
                    required
                  >
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 sm:col-span-2"
                  type="submit"
                >
                  บันทึกข้อมูลผู้ใช้
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({
  className,
  defaultValue,
  label,
  name,
  required = true,
  type = "text",
}: {
  className?: string;
  defaultValue?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        defaultValue={defaultValue}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}
