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
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white shadow-md sm:p-7">
      {/* Decorative Pattern */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-teal-400/15 blur-2xl" />

      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        {/* Left: Cattle Identity & Countdown */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-xs">
              <CalendarClock className="h-3.5 w-3.5 text-emerald-200" />
              Target Idul Adha: {formatIndonesianDate(profile.targetDateQurban)}
            </span>

            {barnName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/45 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                <Warehouse className="h-3 w-3 text-emerald-300" />
                <span>
                  {barnName}
                  {profile.stallNumber ? ` • ${profile.stallNumber}` : ""}
                </span>
              </span>
            )}

            <span className="inline-flex items-center rounded-full bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-100">
              {profile.breed}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">
              Ternak Aktif: {profile.name}
            </p>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {daysToQurban} Hari Lagi
              </h1>
              <span className="text-sm font-medium text-emerald-100">
                menuju hari pemotongan kurban
              </span>
            </div>
          </div>

          {/* Biological Feasibility Pill */}
          <div className="pt-1">
            {isAdgFeasible ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-950/35 px-3.5 py-2 text-xs text-emerald-50 ring-1 ring-white/15 sm:text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                <span>
                  Target PBBH{" "}
                  <strong className="font-bold text-white">
                    {adgRequiredKg.toFixed(2)} kg/hari
                  </strong>{" "}
                  realistis untuk {profile.breed} (&le;{maxBiologicalAdgKg}{" "}
                  kg/hari)
                </span>
              </div>
            ) : (
              <div className="inline-flex items-start gap-2 rounded-xl bg-amber-400/20 px-3.5 py-2.5 text-xs text-amber-50 ring-1 ring-amber-300/50 sm:text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <span>
                  Target PBBH{" "}
                  <strong className="font-bold text-white">
                    {adgRequiredKg.toFixed(2)} kg/hari
                  </strong>{" "}
                  melebihi batas biologis {profile.breed} (~{maxBiologicalAdgKg}{" "}
                  kg/hari). Sesuaikan target di menu Ternak.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Weight Progress Box */}
        <div className="w-full rounded-2xl bg-white/12 p-4 backdrop-blur-md ring-1 ring-white/20 sm:p-5 lg:max-w-sm">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-100">
            <span className="flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-200" />
              Progres Bobot Kurban
            </span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>

          <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-emerald-950/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-emerald-950/30 p-2">
              <p className="text-[10px] text-emerald-200">Awal</p>
              <p className="text-xs font-bold sm:text-sm">
                {formatKg(profile.initialWeightKg, 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white/15 p-2 ring-1 ring-white/25">
              <p className="text-[10px] text-emerald-100">Saat Ini</p>
              <p className="text-xs font-extrabold sm:text-sm">
                {formatKg(profile.currentWeightKg, 1)}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-950/30 p-2">
              <p className="text-[10px] text-emerald-200">Target</p>
              <p className="text-xs font-bold sm:text-sm">
                {formatKg(profile.targetWeightKg, 0)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-xs">
            <span className="flex items-center gap-1 text-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" />
              Kurang{" "}
              <strong className="text-white">{formatKg(remainingKg, 1)}</strong>
            </span>
            <Link
              href={`/profil?detail=${encodeURIComponent(profile.id)}`}
              className="inline-flex items-center gap-1 font-semibold text-emerald-200 transition-colors hover:text-white"
            >
              Catat Timbangan
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
