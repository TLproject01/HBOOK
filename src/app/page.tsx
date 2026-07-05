import Link from "next/link";
import { CalendarDays, Car, DoorOpen, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const modules = [
    { label: "ขอใช้รถ", detail: "ส่งคำขอ ตรวจคนขับ และติดตามผลอนุมัติ", icon: Car },
    { label: "จองห้องประชุม", detail: "ดูตารางว่าง จองซ้ำ และย้ายกำหนดการ", icon: DoorOpen },
    { label: "ควบคุมโดยผู้ดูแล", detail: "จัดการข้อมูลหลัก สิทธิ์ผู้ใช้ และรายงาน", icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-700 text-white">
              <CalendarDays aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-sky-800">HBOOK</p>
              <p className="text-xs text-slate-500">Vehicle & Room Operations</p>
            </div>
          </div>
          <Link
            className="hidden rounded-md border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 shadow-sm hover:border-sky-300 hover:bg-sky-50 sm:inline-flex"
            href="/dashboard"
          >
            ลงชื่อเข้าใช้
          </Link>
        </nav>

        <section className="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              ระบบปฏิบัติงานสำหรับองค์กร
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
              จองรถ จองห้อง และติดตามอนุมัติในที่เดียว
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              HBOOK รวมตารางว่าง คำขอใช้รถ การจองห้องประชุม การแจ้งเตือน และรายงานสำหรับผู้ดูแล
              ให้ทีมทำงานได้เร็วขึ้นโดยไม่ต้องไล่เช็กหลายช่องทาง
            </p>
            <div className="mt-8">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-800"
                href="/dashboard"
              >
                ลงชื่อเข้าใช้
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article
                  className="rounded-lg border border-sky-100 bg-white/90 p-5 shadow-sm"
                  key={module.label}
                >
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">{module.label}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{module.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
