import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HBOOK",
  description: "ระบบจองรถและห้องประชุมสำหรับใช้งานภายในองค์กร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={notoSansThai.variable}>
      <body>{children}</body>
    </html>
  );
}
