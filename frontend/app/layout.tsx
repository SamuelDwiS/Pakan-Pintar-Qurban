import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AppStateProvider } from "@/context/AppStateContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakan Pintar Qurban | Optimasi Ransum & Deteksi Dini PMK",
  description:
    "Asisten digital presisi berbasis AI dan Linear Programming untuk membantu peternak sapi potong rakyat mencapai bobot kurban Idul Adha dengan biaya minimum.",
  applicationName: "Pakan Pintar Qurban",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pakan Pintar Qurban",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">
              Memuat Pakan Pintar Qurban...
            </div>
          }
        >
          <AppStateProvider>
            <AppShell>{children}</AppShell>
          </AppStateProvider>
        </Suspense>
      </body>
    </html>
  );
}
