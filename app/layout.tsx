import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaRegister } from "@/components/PwaRegister";
import { ConfigProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phòng Chơi",
  description: "Phòng chơi kỹ thuật số nhỏ cho trẻ nhỏ.",
  applicationName: "Phòng Chơi",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-icon-180.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#fff1e8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="app-viewport">
        <ConfigProvider>{children}</ConfigProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
