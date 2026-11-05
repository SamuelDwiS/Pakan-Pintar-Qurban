"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Settings2, Warehouse } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { formatKg } from "@/lib/formatters";

export function CattleSelectorBar() {
  const { barns, cattleList, profile, selectActiveCattle } = useAppState();

  if (cattleList.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs sm:text-sm">
        <span className="font-medium text-amber-900">
          Belum ada data hewan ternak di kandang.
        </span>
        <Link
          href="/profil"
          className="rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
        >
          + Tambah Sapi di Menu Ternak
        </Link>
      </div>
    );
  }

  const activeBarn = barns.find((b) => b.id === profile.barnId) || barns[0];
  const activeBarnName = activeBarn?.name || "Kandang Utama A";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-2.5 shadow-2xs sm:px-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-semibold text-slate-500">
          Sapi Dipantau ({cattleList.length} ekor):
        </span>

        <div className="relative">
          <select
            aria-label="Pilih Sapi Aktif"
            value={profile.id}
            onChange={(e) => selectActiveCattle(e.target.value)}
            className="appearance-none rounded-xl border border-emerald-200 bg-emerald-50/70 py-1.5 pl-3 pr-8 text-xs font-bold text-emerald-950 focus:border-emerald-600 focus:outline-none sm:text-sm"
          >
            {cattleList.map((item) => {
              const bName = barns.find((b) => b.id === item.barnId)?.name;
              return (
                <option key={item.id} value={item.id}>
                  {item.name} {bName ? `[${bName}]` : ""} — {item.breed} (
                  {formatKg(item.currentWeightKg, 1)})
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-700" />
        </div>

        {activeBarnName && (
          <span className="hidden items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
            <Warehouse className="h-3.5 w-3.5 text-emerald-700" />
            <span>
              {activeBarnName}
              {profile.stallNumber ? ` • ${profile.stallNumber}` : ""}
            </span>
          </span>
        )}
      </div>

      <Link
        href="/profil"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
      >
        <Settings2 className="h-3.5 w-3.5" />
        <span>Kelola Daftar Ternak</span>
      </Link>
    </div>
  );
}
