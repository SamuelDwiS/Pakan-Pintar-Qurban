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

  return (
    <div className="space-y-6">
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

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatMetricCard
          label="Biaya Pakan Minimum"
          value={`${formatRupiah(optimizationResult.totalCostPerDayRp)}/hr`}
          subtext={`Total s.d. kurban: ${formatRupiah(
            optimizationResult.totalCostToQurbanRp
          )}`}
          icon={<Coins className="h-5 w-5" />}
          tone="emerald"
          badgeText="AI Termurah"
        />

        <StatMetricCard
          label="Target PBBH (ADG)"
          value={`${optimizationResult.adgRequiredKg.toFixed(2)} kg/hr`}
          subtext={`Kenaikan dibutuhkan: ${formatKg(
            Math.max(0, profile.targetWeightKg - profile.currentWeightKg),
            1
          )}`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone={optimizationResult.isAdgFeasible ? "sky" : "amber"}
          badgeText={
            optimizationResult.isAdgFeasible ? "Realistis" : "Melebihi Batas"
          }
        />

        <StatMetricCard
          label="Asupan Bahan Kering"
          value={`${optimizationResult.totalBkProvidedKg.toFixed(2)} kg/hr`}
          subtext={`PK ${optimizationResult.totalPkProvidedKg.toFixed(
            2
          )} kg • TDN ${optimizationResult.totalTdnProvidedKg.toFixed(2)} kg`}
          icon={<Wheat className="h-5 w-5" />}
          tone="slate"
          badgeText="NASEM/NRC"
        />

        <StatMetricCard
          label="Status Risiko PMK"
          value={`Level ${healthStatus.riskLevel}`}
          subtext={`Skor KIAT VETINDO: ${healthStatus.totalScore} poin`}
          icon={<Activity className="h-5 w-5" />}
          tone={healthTone}
        />
      </div>

      {/* Main Analytics Grid: Growth Trajectory & Early Health Screening */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard
            title="Kurva Pertumbuhan & Proyeksi Kurban (AI Regresi)"
            subtitle="Pemodelan regresi adaptif berdasarkan riwayat penimbangan berkala"
            icon={<Scale className="h-5 w-5" />}
            action={
              <Link
                href={`/profil?detail=${encodeURIComponent(profile.id)}`}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200 transition-colors hover:bg-emerald-100"
              >
                <span>Detail &amp; Bobot</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <WeightChart profile={profile} />
          </SectionCard>
        </div>

        <div className="lg:col-span-5">
          <SectionCard
            title="Skrining Kesehatan Mandiri"
            subtitle={`Diperbarui: ${formatDateTimeId(healthStatus.checkedAt)}`}
            icon={<Activity className="h-5 w-5" />}
            action={
              <Link
                href="/kesehatan"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
              >
                <span>Cek Gejala</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Indikator Saat Ini:
                </span>
                <HealthBadge status={healthStatus} variant="compact" />
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Evaluasi Sistem Pakar AI
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  {healthStatus.summary}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {healthStatus.recommendedAction}
                </p>
              </div>

              <Link
                href="/kesehatan"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <Activity className="h-4 w-4" />
                <span>Lakukan Skrining Harian PMK</span>
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Active Least-Cost Ration Summary */}
      <SectionCard
        title={`Racikan Pakan Lokal Biaya Minimum — ${profile.name}`}
        subtitle={`Disusun otomatis untuk bobot ${formatKg(
          profile.currentWeightKg,
          1
        )} dengan target PBBH ${optimizationResult.adgRequiredKg.toFixed(
          2
        )} kg/hari`}
        icon={<Calculator className="h-5 w-5" />}
        action={
          <Link
            href="/ransum"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800"
          >
            <span>Buka Menu Ransum &amp; Rekap Kandang</span>
            <ArrowRight className="h-3.5 w-3.5" />
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
