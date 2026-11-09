"use client";

import React from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Coins,
  Pencil,
  Scale,
  Tag,
  Trash2,
  Warehouse,
} from "lucide-react";
import { HealthBadge } from "@/components/HealthBadge";
import { calculateDaysToQurban } from "@/lib/fallback-engines";
import { formatKg, formatRupiah } from "@/lib/formatters";
import type {
  CattleProfile,
  HealthStatus,
  OptimizationResult,
} from "@/types";

interface CattleCardProps {
  cattle: CattleProfile;
  barnName?: string;
  isActive: boolean;
  healthStatus: HealthStatus;
  optimization?: OptimizationResult;
  onOpenDetail: (cattle: CattleProfile) => void;
  onEdit: (cattle: CattleProfile) => void;
  onDelete: (cattle: CattleProfile) => void;
}

export function CattleCard({
  cattle,
  barnName,
  isActive,
  healthStatus,
  optimization,
  onOpenDetail,
  onEdit,
  onDelete,
}: CattleCardProps) {
  const daysLeft = calculateDaysToQurban(cattle.targetDateQurban);
  const gainNeeded = Math.max(1, cattle.targetWeightKg - cattle.initialWeightKg);
  const gainAchieved = Math.max(
    0,
    cattle.currentWeightKg - cattle.initialWeightKg
  );
  const progressPercent = Math.min(
    100,
    Math.round((gainAchieved / gainNeeded) * 100)
  );
  const requiredAdg = Number(
    (
      Math.max(0, cattle.targetWeightKg - cattle.currentWeightKg) / daysLeft
    ).toFixed(2)
  );
  const maxBioAdg = optimization?.maxBiologicalAdgKg ?? 1.5;

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-3.5 sm:p-5 transition-all hover:shadow-md ${
        isActive
          ? "border-emerald-400 ring-2 ring-emerald-500/15"
          : "border-slate-200/90 shadow-xs"
      }`}
    >
      <div>
        {/* Top Row: Badges & Quick Edit/Delete */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {isActive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <CheckCircle2 className="h-3 w-3" />
                Aktif
              </span>
            )}
            <HealthBadge status={healthStatus} variant="compact" />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(cattle)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-700"
              title="Edit Data Sapi"
              aria-label={`Edit ${cattle.name}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(cattle)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              title="Hapus Data Sapi"
              aria-label={`Hapus ${cattle.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Identity & Barn Location */}
        <div className="mt-2.5 sm:mt-3">
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
            {cattle.name}
          </h3>

          {/* Barn & Stall Badge */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {barnName && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200/80">
                <Warehouse className="h-3 w-3 text-emerald-700" />
                <span>
                  {barnName}
                  {cattle.stallNumber ? ` • ${cattle.stallNumber}` : ""}
                </span>
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {cattle.breed}
            </span>
          </div>

          {cattle.earTag && (
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-slate-500">
              <Tag className="h-3 w-3 text-slate-400" />
              <span>{cattle.earTag}</span>
            </p>
          )}
        </div>

        {/* Weight Progress */}
        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:mt-4 sm:p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-600">
              <Scale className="h-3.5 w-3.5 text-emerald-600" />
              Bobot:{" "}
              <strong className="text-slate-900">
                {formatKg(cattle.currentWeightKg, 1)}
              </strong>
            </span>
            <span className="font-bold text-emerald-700 text-[11px] sm:text-xs">
              Target {formatKg(cattle.targetWeightKg, 0)} ({progressPercent}%)
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysLeft} hr &bull; Naik{" "}
              <strong
                className={
                  requiredAdg <= maxBioAdg ? "text-slate-700" : "text-amber-700"
                }
              >
                {requiredAdg} kg/hr
              </strong>
            </span>

            {optimization && optimization.totalCostPerDayRp > 0 && (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                <Coins className="h-3 w-3" />
                {formatRupiah(optimization.totalCostPerDayRp)}/hr
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Action: Open Detail Profile & Weight Logs */}
      <div className="mt-3 pt-0.5 sm:mt-4 sm:pt-1">
        <button
          type="button"
          onClick={() => onOpenDetail(cattle)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-800 sm:py-3 sm:text-sm"
        >
          <span>Detail Profil &amp; Timbang</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
