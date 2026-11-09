"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Scale,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { formatIndonesianDate, formatKg } from "@/lib/formatters";
import type { CattleProfile } from "@/types";

interface CountdownCardProps {
  profile: CattleProfile;
  barnName?: string;
  daysToQurban: number;
  adgRequiredKg: number;
  maxBiologicalAdgKg?: number;
  isAdgFeasible: boolean;
}

export function CountdownCard({
  profile,
  barnName,
  daysToQurban,
  adgRequiredKg,
  maxBiologicalAdgKg = 1.5,
  isAdgFeasible,
}: CountdownCardProps) {
  const totalGainNeeded = Math.max(
    1,
    profile.targetWeightKg - profile.initialWeightKg
  );
  const achievedGain = Math.max(
    0,
    profile.currentWeightKg - profile.initialWeightKg
  );
  const progressPercent = Math.min(
    100,
    Math.round((achievedGain / totalGainNeeded) * 100)
  );
  const remainingKg = Math.max(
    0,
    profile.targetWeightKg - profile.currentWeightKg
  );

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-4 text-white shadow-md sm:p-6">
      {/* Decorative Pattern */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 h-36 w-36 rounded-full bg-teal-400/15 blur-2xl" />

      <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        {/* Left: Cattle Identity & Countdown */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-xs sm:text-xs">
              <CalendarClock className="h-3 w-3 text-emerald-200" />
              Target: {formatIndonesianDate(profile.targetDateQurban)}
            </span>

            {barnName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/45 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100 sm:text-xs">
                <Warehouse className="h-3 w-3 text-emerald-300" />
                <span>
                  {barnName}
                  {profile.stallNumber ? ` • ${profile.stallNumber}` : ""}
                </span>
              </span>
            )}

            <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-100 sm:text-xs">
              {profile.breed}
            </span>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Sapi: {profile.name}
            </p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
              <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
                {daysToQurban} Hari Lagi
              </h1>
              <span className="text-xs font-medium text-emerald-100 sm:text-sm">
                menuju Idul Adha
              </span>
            </div>
          </div>

          {/* Biological Feasibility Pill */}
          <div className="pt-0.5">
            {isAdgFeasible ? (
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/35 px-3 py-1.5 text-xs text-emerald-50 ring-1 ring-white/15">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" />
                <span>
                  Target naik{" "}
                  <strong className="font-bold text-white">
                    {adgRequiredKg.toFixed(2)} kg/hr
                  </strong>{" "}
                  realistis
                </span>
              </div>
            ) : (
              <div className="inline-flex items-start gap-1.5 rounded-xl bg-amber-400/20 px-3 py-1.5 text-xs text-amber-50 ring-1 ring-amber-300/50">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                <span>
                  Target naik{" "}
                  <strong className="font-bold text-white">
                    {adgRequiredKg.toFixed(2)} kg/hr
                  </strong>{" "}
                  melebihi batas {profile.breed} (~{maxBiologicalAdgKg} kg/hr)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Weight Progress Box */}
        <div className="w-full rounded-2xl bg-white/12 p-3.5 backdrop-blur-md ring-1 ring-white/20 sm:p-4 lg:max-w-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-100">
            <span className="flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-emerald-200" />
              Progres Bobot
            </span>
            <span className="font-black text-white">{progressPercent}%</span>
          </div>

          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-emerald-950/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-xl bg-emerald-950/30 p-1.5">
              <p className="text-[10px] text-emerald-200">Awal</p>
              <p className="text-xs font-bold sm:text-sm">
                {formatKg(profile.initialWeightKg, 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-1.5 ring-1 ring-white/25">
              <p className="text-[10px] text-emerald-100">Saat Ini</p>
              <p className="text-xs font-black sm:text-sm">
                {formatKg(profile.currentWeightKg, 1)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-950/30 p-1.5">
              <p className="text-[10px] text-emerald-200">Target</p>
              <p className="text-xs font-bold sm:text-sm">
                {formatKg(profile.targetWeightKg, 0)}
              </p>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-white/15 pt-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-100 text-[11px] sm:text-xs">
              <TrendingUp className="h-3 w-3" />
              Kurang{" "}
              <strong className="text-white">{formatKg(remainingKg, 1)}</strong>
            </span>
            <Link
              href={`/profil?detail=${encodeURIComponent(profile.id)}`}
              className="inline-flex items-center gap-1 font-bold text-emerald-200 transition-colors hover:text-white text-[11px] sm:text-xs"
            >
              + Timbang Sapi
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
