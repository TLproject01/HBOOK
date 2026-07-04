import { Building2, Power, Trash2 } from "lucide-react";

import { getPrisma } from "@/lib/db/prisma";
import {
  createDepartmentAction,
  softDeleteDepartmentAction,
  toggleDepartmentStatusAction,
  updateDepartmentAction,
} from "./actions";

export default async function DepartmentsPage() {
  const prisma = getPrisma();
  const departments = await prisma.department.findMany({
    where: { deletedAt: null },
    include: {
      _count: {
        select: { users: true },
      },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Departments</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage departments used by profiles, bookings, reports, and snapshots.
          </p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form
          action={createDepartmentAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <Building2 aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">Create department</h2>
          </div>
          <label className="mt-5 block">
            <span className="text-sm font-medium text-slate-700">Department name</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="name"
              required
              type="text"
            />
          </label>
          <button
            className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            Create department
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Users</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-4 py-3 font-medium text-slate-950">
                    <form action={updateDepartmentAction} className="flex gap-2">
                      <input name="id" type="hidden" value={department.id} />
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        defaultValue={department.name}
                        name="name"
                        required
                        type="text"
                      />
                      <button
                        className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                        type="submit"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{department._count.users}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {department.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={toggleDepartmentStatusAction}>
                        <input name="id" type="hidden" value={department.id} />
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
                          title={department.isActive ? "Deactivate" : "Activate"}
                          type="submit"
                        >
                          <Power aria-hidden className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={softDeleteDepartmentAction}>
                        <input name="id" type="hidden" value={department.id} />
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={department._count.users > 0}
                          title="Soft delete"
                          type="submit"
                        >
                          <Trash2 aria-hidden className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
