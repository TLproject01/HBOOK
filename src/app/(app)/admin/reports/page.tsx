import { Download } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sky-700">
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">รายงาน</h1>
        <p className="mt-2 text-sm text-slate-600">
          ส่งออกรายการใช้รถ รายการจองห้องประชุม และประวัติการใช้งานเป็นไฟล์ Excel
        </p>
      </div>

      <form
        action="/admin/reports/export"
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        method="get"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="วันที่เริ่มต้น" name="startDate" type="date" />
          <Field label="วันที่สิ้นสุด" name="endDate" type="date" />
        </div>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white"
          type="submit"
        >
          <Download aria-hidden className="h-4 w-4" />
          ดาวน์โหลด Excel
        </button>
      </form>
    </main>
  );
}

function Field({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        name={name}
        type={type}
      />
    </label>
  );
}
