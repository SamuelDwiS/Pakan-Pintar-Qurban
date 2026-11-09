"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  Calculator,
  ChevronRight,
  Database,
  Home,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Scale,
  Server,
  User,
  Warehouse,
  WifiOff,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAppState } from "@/context/AppStateContext";

export const OPERATIONAL_NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard Kandang",
    shortLabel: "Beranda",
    description: "Ringkasan performa, biaya pakan & countdown kurban",
    icon: LayoutDashboard,
  },
  {
    href: "/profil",
    label: "Ternak & Bobot",
    shortLabel: "Ternak",
    description: "Daftar sapi kurban, penempatan kandang & riwayat timbang",
    icon: Scale,
  },
  {
    href: "/ransum",
    label: "Optimasi Ransum AI",
    shortLabel: "Ransum",
    description: "Formulasi pakan biaya minimum per ekor & per kandang",
    icon: Calculator,
  },
  {
    href: "/kesehatan",
    label: "Skrining Kesehatan",
    shortLabel: "Kesehatan",
    description: "Deteksi dini risiko PMK & rekomendasi tindakan",
    icon: Activity,
  },
] as const;

export const MASTER_NAV_ITEMS = [
  {
    href: "/master-kandang",
    label: "Master Kandang",
    shortLabel: "Master",
    description: "Data blok kandang, kapasitas & pengaturan musim kurban",
    icon: Warehouse,
  },
  {
    href: "/master-pakan",
    label: "Master Pakan & Ras",
    shortLabel: "Pakan/Ras",
    description: "Katalog bahan pakan lokal, nutrisi & standar bangsa sapi",
    icon: Database,
  },
] as const;

export const NAV_ITEMS = [
  ...OPERATIONAL_NAV_ITEMS,
  ...MASTER_NAV_ITEMS,
] as const;

export const MOBILE_NAV_ITEMS = [
  {
    href: "/",
    shortLabel: "Beranda",
    icon: Home,
    matchPrefix: "/",
  },
  {
    href: "/profil",
    shortLabel: "Ternak",
    icon: Scale,
    matchPrefix: "/profil",
  },
  {
    href: "/ransum",
    shortLabel: "Ransum",
    icon: Calculator,
    matchPrefix: "/ransum",
  },
  {
    href: "/kesehatan",
    shortLabel: "Kesehatan",
    icon: Activity,
    matchPrefix: "/kesehatan",
  },
  {
    href: "/master-kandang",
    shortLabel: "Data Master",
    icon: Database,
    matchPrefix: "/master-",
  },
] as const;

interface NavbarHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenGlossary: () => void;
}

export function NavbarHeader({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenGlossary,
}: NavbarHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { apiMode, currentUser, logout, resetAllDemoData } = useAppState();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    ) || NAV_ITEMS[0];

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    router.replace("/login");
  };

  const handleResetDemo = () => {
    if (
      window.confirm(
        "Kembalikan seluruh data kandang, sapi, harga pakan, dan status kesehatan ke data awal demo?"
      )
    ) {
      resetAllDemoData();
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Mobile Header (< md) */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 md:hidden">
        <Link href="/">
          <BrandLogo
            variant="header"
            tone="dark"
            subtitle={currentUser?.farmName || "AI Ransum & Skrining PMK"}
          />
        </Link>

        {currentUser && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              title={`Akun: ${currentUser.name}`}
              aria-label={`Akun ${currentUser.name}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <User className="h-4 w-4" />
              </div>
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-slate-900/5">
                <div className="border-b border-slate-100 pb-2.5">
                  <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                    Peternak Mandiri
                  </span>
                  <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
                    {currentUser.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-emerald-700">
                    {currentUser.farmName}
                  </p>
                </div>

                <div className="space-y-1 py-2 border-b border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenGlossary();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <BookOpen className="h-4 w-4 text-emerald-700" />
                    <span>Panduan Istilah Pakan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      handleResetDemo();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-4 w-4 text-slate-500" />
                    <span>Reset Data Demo</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Keluar Akun</span>
                    </span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Topbar (>= md) */}
      <div className="hidden h-16 items-center justify-between gap-4 px-5 md:flex lg:px-7">
        {/* Kiri: Arrow Right (hanya muncul saat sidebar tertutup/collapsed) + Judul Menu */}
        <div className="flex min-w-0 items-center gap-3">
          {sidebarCollapsed && (
            <>
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Buka Sidebar"
                aria-label="Buka Sidebar"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-800"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
              <div className="h-6 w-px shrink-0 bg-slate-200" />
            </>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-sm font-extrabold text-slate-900">
              {currentNav.label}
            </h2>
            <p className="truncate text-xs text-slate-500">
              {/* {currentNav.description} */}
            </p>
          </div>
        </div>

        {/* Kanan: Engine Status, Panduan Istilah & Dropdown User Peternak */}
        <div className="flex shrink-0 items-center gap-2 lg:gap-2.5">
          {/* Engine Mode Pill */}
          {/* <div
            className={`hidden items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold ring-1 ring-inset xl:inline-flex ${
              apiMode === "backend"
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-amber-50/80 text-amber-900 ring-amber-200"
            }`}
          >
            {apiMode === "backend" ? (
              <>
                <Server className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Engine: FastAPI AI Server</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>Engine: AI Solver Mandiri PWA</span>
              </>
            )}
          </div> */}

          {/* Panduan Istilah */}
          <button
            type="button"
            onClick={onOpenGlossary}
            title="Panduan Istilah Pakan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-emerald-800"
          >
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span className="hidden lg:inline">Panduan Istilah</span>
          </button>

          {/* Reset Seluruh Data Demo */}
          <button
            type="button"
            onClick={handleResetDemo}
            title="Reset Seluruh Data Demo"
            aria-label="Reset Seluruh Data Demo"
            className="inline-flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* User Profile Avatar Icon Button (Hanya Ikon Avatar, Nama Tampil di Dropdown) */}
          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                title={`Akun: ${currentUser.name}`}
                aria-label={`Akun ${currentUser.name}`}
                className={`relative flex h-9.5 w-9.5 items-center justify-center rounded-xl border transition-all ${
                  userDropdownOpen
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                    : "border-slate-200/90 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800"
                }`}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
                {/* Tiny Online / Active Status Dot */}
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </button>

              {/* Simple User Dropdown Panel */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5 transition-all">
                  <div className="border-b border-slate-100 pb-2.5">
                    <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      Peternak Mandiri
                    </span>
                    <p className="mt-1.5 truncate text-sm font-extrabold text-slate-900">
                      {currentUser.name}
                    </p>
                    <p className="truncate text-xs font-semibold text-emerald-700">
                      {currentUser.farmName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                      {currentUser.identifier}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Keluar Akun</span>
                      </span>
                      <span className="text-[11px] opacity-75">&rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
