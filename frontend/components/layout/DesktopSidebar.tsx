"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LogOut, User, Warehouse } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAppState } from "@/context/AppStateContext";
import { formatKg } from "@/lib/formatters";
import { MASTER_NAV_ITEMS, OPERATIONAL_NAV_ITEMS } from "./NavbarHeader";

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function DesktopSidebar({
  collapsed,
  onToggleCollapse,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    logout,
    barns,
    feeds,
    cattleList,
    profile,
    healthByCattleId,
  } = useAppState();

  const hasRedAlert = cattleList.some(
    (c) => healthByCattleId[c.id]?.riskLevel === "MERAH"
  );
  const hasYellowAlert = cattleList.some(
    (c) => healthByCattleId[c.id]?.riskLevel === "KUNING"
  );

  const activeBarn = barns.find((b) => b.id === profile.barnId) || barns[0];
  const activeBarnName = activeBarn?.name || "Kandang Utama A";
  const activeFeedCount = feeds.filter((f) => f.isActive).length;

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <aside
      aria-label="Navigasi Samping Desktop"
      className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-emerald-950/30 bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg transition-all duration-200 md:flex ${
        collapsed ? "w-20" : "w-68"
      }`}
    >
      {/* Top Brand Header — Full Hijau Emerald Menyatu dengan Sidebar */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center overflow-hidden ${
            collapsed ? "w-full justify-center" : ""
          }`}
        >
          <BrandLogo
            variant={collapsed ? "icon" : "header"}
            tone="light"
            subtitle="Smart Livestock AI"
          />
        </Link>

        {/* Arrow Left untuk Ciutkan Sidebar (Hanya Muncul Saat Sidebar Terbuka) */}
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-emerald-200 transition-colors hover:bg-white/10 hover:text-white"
            title="Ciutkan Sidebar"
            aria-label="Ciutkan Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Active Cattle Quick Card */}
      {!collapsed && cattleList.length > 0 && (
        <div className="px-3.5 pt-4">
          <Link
            href={`/profil?detail=${encodeURIComponent(profile.id)}`}
            className="block rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-xs transition-all hover:bg-white/15 hover:ring-white/30"
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <span>Sapi Aktif Dipantau</span>
              <span className="rounded-full bg-emerald-950/50 px-2 py-0.5 text-emerald-100">
                {cattleList.length} Ekor
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-extrabold text-white">
              {profile.name}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-medium text-emerald-100/90">
              <Warehouse className="h-3 w-3 shrink-0 text-emerald-300" />
              <span className="truncate">{activeBarnName}</span>
              <span>&bull;</span>
              <span>{formatKg(profile.currentWeightKg, 1)}</span>
            </p>
          </Link>
        </div>
      )}

      {/* Navigation Links (Grouped: Operasional & Data Master) */}
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {/* Group 1: Operasional Kandang */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
              Operasional Harian
            </p>
          )}

          {OPERATIONAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-xl transition-all ${
                  collapsed
                    ? "justify-center p-3"
                    : "justify-between gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-emerald-100/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive
                        ? "text-emerald-700"
                        : "text-emerald-200 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold sm:text-sm">
                        {item.label}
                      </p>
                      <p
                        className={`truncate text-[11px] ${
                          isActive
                            ? "text-emerald-700/80"
                            : "text-emerald-200/70"
                        }`}
                      >
                        {item.shortLabel === "Beranda"
                          ? "Ringkasan & countdown"
                          : item.shortLabel === "Ternak"
                          ? "CRUD sapi & timbangan"
                          : item.shortLabel === "Ransum"
                          ? "Solver pakan termurah"
                          : "Cek gejala PMK"}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && item.href === "/profil" && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {cattleList.length}
                  </span>
                )}

                {item.href === "/kesehatan" &&
                  (hasRedAlert || hasYellowAlert) && (
                    <span
                      className={`${
                        collapsed ? "absolute right-2.5 top-2.5" : ""
                      } h-2.5 w-2.5 rounded-full ring-2 ring-emerald-900 ${
                        hasRedAlert
                          ? "animate-pulse bg-rose-500"
                          : "bg-amber-400"
                      }`}
                    />
                  )}
              </Link>
            );
          })}
        </div>

        {/* Group 2: Data Master */}
        <div className="space-y-1 border-t border-white/10 pt-3">
          {!collapsed && (
            <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
              Data Master Kandang
            </p>
          )}

          {MASTER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-xl transition-all ${
                  collapsed
                    ? "justify-center p-3"
                    : "justify-between gap-2.5 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-white text-emerald-950 shadow-sm"
                    : "text-emerald-100/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive
                        ? "text-emerald-700"
                        : "text-emerald-200 group-hover:text-white"
                    }`}
                  />
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold sm:text-sm">
                        {item.label}
                      </p>
                      <p
                        className={`truncate text-[11px] ${
                          isActive
                            ? "text-emerald-700/80"
                            : "text-emerald-200/70"
                        }`}
                      >
                        {item.href === "/master-kandang"
                          ? "Blok kandang & WA darurat"
                          : "Bahan pakan & bangsa sapi"}
                      </p>
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-white/15 text-white"
                    }`}
                  >
                    {item.href === "/master-kandang"
                      ? barns.length
                      : activeFeedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Account Card at Bottom of Sidebar */}
      {currentUser && (
        <div className="border-t border-white/10 p-3">
          <div
            className={`flex items-center rounded-xl bg-emerald-950/45 p-2.5 ring-1 ring-white/15 ${
              collapsed ? "justify-center" : "justify-between gap-2"
            }`}
          >
            {!collapsed ? (
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">
                    {currentUser.name}
                  </p>
                  <p className="truncate text-[10px] font-medium text-emerald-200/85">
                    {currentUser.farmName || "Peternak Mandiri"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200"
                title={`${currentUser.name} (${currentUser.farmName})`}
              >
                <User className="h-4 w-4" />
              </div>
            )}

            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar Akun (Logout)"
                aria-label="Keluar Akun"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-emerald-200 transition-colors hover:bg-rose-500/25 hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
