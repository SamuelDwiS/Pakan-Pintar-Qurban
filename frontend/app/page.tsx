"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Calculator,
  Coins,
  Scale,
  TrendingUp,
  Wheat,
} from "lucide-react";
import { CountdownCard } from "@/components/CountdownCard";
import { HealthBadge } from "@/components/HealthBadge";
import { RationTable } from "@/components/RationTable";
import { CattleSelectorBar } from "@/components/ui/CattleSelectorBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatMetricCard } from "@/components/ui/StatMetricCard";
import { WeightChart } from "@/components/WeightChart";
import { useAppState } from "@/context/AppStateContext";
import { formatDateTimeId, formatKg, formatRupiah } from "@/lib/formatters";

export default function DashboardPage() {
  const {
    barns,
    profile,
    daysToQurban,
    optimizationResult,
    healthStatus,
  } = useAppState();

  const activeBarn = barns.find((b) => b.id === profile.barnId) || barns[0];
  const activeBarnName = activeBarn?.name || "Kandang Utama A";

  const healthTone =
    healthStatus.riskLevel === "MERAH"
      ? "rose"
      : healthStatus.riskLevel === "KUNING"
      ? "amber"
      : "emerald";

  const totalAsFedKg = optimizationResult.rationComposition.reduce(
    (acc, item) => acc + item.amountAsFedKg,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Multi-Cattle Switcher */}
      <CattleSelectorBar />

      {/* Hero Countdown & Cattle Progress */}
      <CountdownCard
        profile={profile}
        barnName={activeBarnName}
        daysToQurban={daysToQurban}
        adgRequiredKg={optimizationResult.adgRequiredKg}
        maxBiologicalAdgKg={optimizationResult.maxBiologicalAdgKg}
        isAdgFeasible={optimizationResult.isAdgFeasible}
      />

      {/* 4 KPI Summary Cards (2x2 di HP, 4 kolom di Laptop) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
        <StatMetricCard
          label="Biaya Pakan"
          value={`${formatRupiah(optimizationResult.totalCostPerDayRp)}/hr`}
          subtext={`Total: ${formatRupiah(optimizationResult.totalCostToQurbanRp)}`}
          icon={<Coins className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="emerald"
          badgeText="Hemat AI"
        />

        <StatMetricCard
          label="Target Naik Bobot"
          value={`${optimizationResult.adgRequiredKg.toFixed(2)} kg/hr`}
          subtext={`Kurang: ${formatKg(
            Math.max(0, profile.targetWeightKg - profile.currentWeightKg),
            1
          )}`}
          icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone={optimizationResult.isAdgFeasible ? "sky" : "amber"}
          badgeText={
            optimizationResult.isAdgFeasible ? "Realistis" : "Batas Maks"
          }
        />

        <StatMetricCard
          label="Porsi Pakan Segar"
          value={`${formatKg(totalAsFedKg, 1)}/hr`}
          subtext="Rumput & konsentrat"
          icon={<Wheat className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone="slate"
          badgeText="Standar NRC"
        />

        <StatMetricCard
          label="Kondisi Sapi"
          value={
            healthStatus.riskLevel === "HIJAU"
              ? "Sehat"
              : healthStatus.riskLevel === "KUNING"
              ? "Waspada"
              : "Bahaya PMK"
          }
          subtext={`Skor: ${healthStatus.totalScore} poin`}
          icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
          tone={healthTone}
          badgeText={healthStatus.riskLevel}
        />
      </div>

      {/* Main Analytics Grid: Growth Trajectory & Early Health Screening */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard
            title="Grafik Kenaikan Bobot"
            subtitle="Perkiraan bobot sampai hari Idul Adha"
            icon={<Scale className="h-4 w-4 sm:h-5 sm:w-5" />}
            action={
              <Link
                href={`/profil?detail=${encodeURIComponent(profile.id)}`}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100"
              >
                <span>Catat Timbang</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <WeightChart profile={profile} />
          </SectionCard>
        </div>

        <div className="lg:col-span-5">
          <SectionCard
            title="Kondisi Kesehatan Terakhir"
            subtitle={`Dicek: ${formatDateTimeId(healthStatus.checkedAt)}`}
            icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
            action={
              <Link
                href="/kesehatan"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
              >
                <span>Cek Fisik</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            }
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Status Saat Ini:
                </span>
                <HealthBadge status={healthStatus} variant="compact" />
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Ringkasan
                </p>
                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900">
                  {healthStatus.summary}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2 sm:line-clamp-none">
                  {healthStatus.recommendedAction}
                </p>
              </div>

              <Link
                href="/kesehatan"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <Activity className="h-4 w-4" />
                <span>Periksa Kesehatan Sapi Hari Ini</span>
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Active Least-Cost Ration Summary */}
      <SectionCard
        title={`Menu Pakan Hari Ini — ${profile.name}`}
        subtitle={`Porsi rumput & konsentrat untuk bobot ${formatKg(
          profile.currentWeightKg,
          0
        )}`}
        icon={<Calculator className="h-4 w-4 sm:h-5 sm:w-5" />}
        action={
          <Link
            href="/ransum"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-800"
          >
            <span>Ubah Pakan</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        }
      >
        <RationTable
          result={optimizationResult}
          daysToQurban={daysToQurban}
          compact
        />
      </SectionCard>
    </div>
  );
}
