import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
        HBOOK
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl">
        ระบบจองรถและห้องประชุมภายในองค์กร
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
        ตรวจสอบตารางว่าง ส่งคำขอใช้รถ จองห้องประชุม และติดตามผลอนุมัติได้ในที่เดียว
        พร้อมสิทธิ์ผู้ดูแลสำหรับจัดการข้อมูลหลักและรายงาน
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="min-w-28 rounded-md bg-teal-700 px-5 py-2.5 text-center text-sm font-medium text-white"
          href="/dashboard"
        >
          เข้าสู่ระบบงาน
        </Link>
        <Link
          className="min-w-28 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-center text-sm font-medium text-slate-800"
          href="/login"
        >
          ลงชื่อเข้าใช้
        </Link>
      </div>
    </main>
  );
}
