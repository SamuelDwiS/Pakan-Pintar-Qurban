"use client";

import React from "react";
import Link from "next/link";
import { Plus, Settings2, Warehouse } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { formatKg } from "@/lib/formatters";

export function CattleSelectorBar() {
  const { barns, cattleList, profile, healthByCattleId, selectActiveCattle } =
    useAppState();

  if (cattleList.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs sm:text-sm">
        <span className="font-semibold text-amber-900">
          Belum ada data sapi di kandang.
        </span>
        <Link
          href="/profil"
          className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
        >
          + Tambah Sapi
        </Link>
      </div>
    );
  }

  const activeBarn = barns.find((b) => b.id === profile.barnId) || barns[0];
  const activeBarnName = activeBarn?.name || "Kandang Utama A";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
            Pilih Sapi ({cattleList.length} ekor)
          </span>
          {activeBarnName && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-600">
              <Warehouse className="h-3 w-3 text-emerald-700" />
              <span>
                {activeBarnName}
                {profile.stallNumber ? ` • ${profile.stallNumber}` : ""}
              </span>
            </span>
          )}
        </div>

        <Link
          href="/profil"
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-700 hover:text-emerald-900"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Kelola Ternak</span>
          <span className="sm:hidden">Kelola</span>
        </Link>
      </div>

      {/* Horizontal Scrollable Cow Chips (Touch-Friendly for Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {cattleList.map((item) => {
          const isSelected = item.id === profile.id;
          const hStatus = healthByCattleId[item.id];
          const dotColor =
            hStatus?.riskLevel === "MERAH"
              ? "bg-rose-500 animate-pulse"
              : hStatus?.riskLevel === "KUNING"
              ? "bg-amber-500"
              : "bg-emerald-500";

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectActiveCattle(item.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
                isSelected
                  ? "bg-emerald-700 text-white font-extrabold shadow-xs ring-2 ring-emerald-600/30"
                  : "bg-slate-50 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${dotColor}`} />
              <span className="whitespace-nowrap">{item.name}</span>
              <span
                className={`text-[10px] rounded-md px-1.5 py-0.5 ${
                  isSelected
                    ? "bg-emerald-800/80 text-emerald-100"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {formatKg(item.currentWeightKg, 0)}
              </span>
            </button>
          );
        })}

        <Link
          href="/profil"
          className="flex shrink-0 items-center gap-1 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-2.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100/60"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Tambah</span>
        </Link>
      </div>
    </div>
  );
}
