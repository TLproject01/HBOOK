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
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Users</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create Supabase Auth users and maintain their booking profiles.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createUserAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <UserPlus aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">Create user</h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Employee code" name="employeeCode" />
            <Field label="Username" name="username" />
            <Field className="sm:col-span-2" label="Full name" name="name" />
            <Field className="sm:col-span-2" label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" required={false} />
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Role</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="role"
              >
                <option value={UserRole.USER}>User</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Department</span>
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
              label="Initial password"
              name="initialPassword"
              type="password"
            />
          </div>

          <button
            className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            Create Supabase user
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
                      {user.role}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                    {user.mustChangePassword ? (
                      <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
                        Must change password
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
                      <option value={UserRole.USER}>User</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title="Update role"
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
                      placeholder="New password"
                      type="password"
                    />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title="Reset password"
                      type="submit"
                    >
                      <KeyRound aria-hidden className="h-4 w-4" />
                    </button>
                  </form>

                  <form action={toggleUserStatusAction}>
                    <input name="id" type="hidden" value={user.id} />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                      title={user.isActive ? "Deactivate" : "Activate"}
                      type="submit"
                    >
                      <Power aria-hidden className="h-4 w-4" />
                    </button>
                  </form>

                  <form action={softDeleteUserAction}>
                    <input name="id" type="hidden" value={user.id} />
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700"
                      title="Soft delete"
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
                <Field defaultValue={user.employeeCode} label="Employee code" name="employeeCode" />
                <Field defaultValue={user.username} label="Username" name="username" />
                <Field
                  className="sm:col-span-2"
                  defaultValue={user.name}
                  label="Full name"
                  name="name"
                />
                <Field
                  className="sm:col-span-2"
                  defaultValue={user.email ?? ""}
                  label="Email"
                  name="email"
                  type="email"
                />
                <Field
                  defaultValue={user.phone ?? ""}
                  label="Phone"
                  name="phone"
                  required={false}
                />
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Department</span>
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
                  Save profile
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
