"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { GlossaryModal } from "@/components/ui/GlossaryModal";
import { DeveloperTeamFloatingWidget } from "@/components/ui/DeveloperTeamFloatingWidget";
import { useAppState } from "@/context/AppStateContext";
import { BottomMobileNav } from "./BottomMobileNav";
import { DesktopSidebar } from "./DesktopSidebar";
import { NavbarHeader } from "./NavbarHeader";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    isHydrated,
    isAuthenticated,
    cattleList,
    healthByCattleId,
    selectActiveCattle,
  } = useAppState();

  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/login");
    } else if (isAuthenticated && isLoginRoute) {
      router.replace("/");
    }
  }, [isHydrated, isAuthenticated, isLoginRoute, router]);

  // Halaman Login ditampilkan penuh tanpa Sidebar & Navbar
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // Tunggu hidrasi sesi agar tidak terjadi kedipan halaman sebelum redirect login
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-semibold text-slate-500">
        Memuat sesi kandang Pakan Pintar Qurban...
      </div>
    );
  }

  const redAlertCattle = cattleList.find(
    (c) => healthByCattleId[c.id]?.riskLevel === "MERAH"
  );
  const redAlertStatus = redAlertCattle
    ? healthByCattleId[redAlertCattle.id]
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Left Sidebar Navigation (Full Hijau Emerald) */}
      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      {/* Right Main Workspace Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <NavbarHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          onOpenGlossary={() => setGlossaryOpen(true)}
        />

        {/* Peringatan Darurat Global jika Ada Sapi di Kandang Berstatus MERAH */}
        {redAlertCattle && redAlertStatus && (
          <div className="border-b border-rose-300 bg-rose-600 px-4 py-2.5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 shrink-0 animate-pulse" />
                <span>
                  PERINGATAN MERAH ({redAlertCattle.name}): Terindikasi gejala
                  risiko PMK (Skor {redAlertStatus.totalScore}). Segera isolasi
                  ternak &amp; cek panduan tindakan darurat!
                </span>
              </div>
              <Link
                href="/kesehatan"
                onClick={() => selectActiveCattle(redAlertCattle.id)}
                className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-50"
              >
                Lihat Protokol Darurat
              </Link>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-28 pt-3.5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-8">
          {children}
        </main>

        <footer className="hidden border-t border-slate-200/80 bg-white py-5 text-xs text-slate-500 md:block">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 lg:px-8">
            <p>
              <strong className="font-semibold text-slate-700">
                Pakan Pintar Qurban
              </strong>{" "}
              {/* — Universitas Pignatelli Triputra, Surakarta */}
            </p>
            {/* <p>
              Lomba Prototype Pekan Insinyur Peternakan UGM 2026 &bull; Standar
              NASEM/NRC &amp; KIAT VETINDO PMK
            </p> */}
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomMobileNav />

      <GlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />

      {/* Floating Pop-up Asisten / Info Tim Pengembang & Kemitraan */}
      <DeveloperTeamFloatingWidget />
    </div>
  );
}
