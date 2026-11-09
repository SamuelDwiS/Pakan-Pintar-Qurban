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
    farmSettings,
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

  // ── Proyeksi nilai jual kurban (data lapangan Sragen) ─────────────────────
  // 1 kwintal = 100 kg. Harga kurban Rp 80 jt/kwintal = Rp 800.000/kg
  const hargaEidPerKg = (farmSettings?.pricePerKwintalEid ?? 80_000_000) / 100;
  const hargaBiasaPerKg = (farmSettings?.pricePerKwintalNormal ?? 55_000_000) / 100;
  const maxLayakKg = farmSettings?.maxQurbanWeightKg ?? 700;
  const proyeksiNilaiEid = Math.round(profile.targetWeightKg * hargaEidPerKg);
  const proyeksiNilaiBiasa = Math.round(profile.targetWeightKg * hargaBiasaPerKg);
  const selisihHarga = proyeksiNilaiEid - proyeksiNilaiBiasa;
  const isOverMaxWeight = profile.targetWeightKg > maxLayakKg;

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
          label="Biaya Pakan / Hari"
          value={`${formatRupiah(optimizationResult.totalCostPerDayRp)}/hr`}
          subtext={`Total hingga kurban: ${formatRupiah(
            optimizationResult.totalCostToQurbanRp
          )}`}
          icon={<Coins className="h-5 w-5" />}
          tone="emerald"
          badgeText="Biaya Min."
        />

        <StatMetricCard
          label="Kenaikan Bobot / Hari"
          value={`${optimizationResult.adgRequiredKg.toFixed(2)} kg/hr`}
          subtext={`Perlu naik: ${formatKg(
            Math.max(0, profile.targetWeightKg - profile.currentWeightKg),
            1
          )} lagi`}
          icon={<TrendingUp className="h-5 w-5" />}
          tone={optimizationResult.isAdgFeasible ? "sky" : "amber"}
          badgeText={
            optimizationResult.isAdgFeasible ? "Realistis" : "Perlu Dikaji"
          }
        />

        <StatMetricCard
          label="Asupan Pakan Harian"
          value={`${optimizationResult.totalBkProvidedKg.toFixed(2)} kg BK`}
          subtext={`PK ${optimizationResult.totalPkProvidedKg.toFixed(
            2
          )} kg • TDN ${optimizationResult.totalTdnProvidedKg.toFixed(2)} kg`}
          icon={<Wheat className="h-5 w-5" />}
          tone="slate"
          badgeText="Gizi Terpenuhi"
        />

        <StatMetricCard
          label="Status Kesehatan"
          value={`Level ${healthStatus.riskLevel}`}
          subtext={`Skor risiko: ${healthStatus.totalScore} poin`}
          icon={<Activity className="h-5 w-5" />}
          tone={healthTone}
        />
      </div>

      {/* Panel Proyeksi Nilai Jual Kurban — Data Lapangan Sragen */}
      <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-emerald-50/60 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span>💰</span> Proyeksi Nilai Jual Sapi Kurban
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Estimasi nilai jual {profile.name} pada target {profile.targetWeightKg} kg (Pasar Kurban Sragen)
            </p>
          </div>
          {isOverMaxWeight ? (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
              Melebihi bobot ideal kurban ({maxLayakKg} kg)
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              Kategori Layak Kurban (&le; {maxLayakKg} kg / 7 Kwintal)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/90 border border-slate-200/80 p-3.5 text-center shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Harga Hari Biasa
            </p>
            <p className="text-xl font-extrabold text-slate-700 mt-1">
              {formatRupiah(proyeksiNilaiBiasa)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rp {((farmSettings?.pricePerKwintalNormal ?? 55_000_000) / 1_000_000).toFixed(0)} Jt / Kwintal
            </p>
          </div>

          <div className="rounded-xl bg-amber-500 border border-amber-400 p-3.5 text-center shadow-xs text-white">
            <p className="text-[11px] font-semibold text-amber-100 uppercase tracking-wide">
              Harga Menjelang Idul Adha
            </p>
            <p className="text-xl font-extrabold text-white mt-1">
              {formatRupiah(proyeksiNilaiEid)}
            </p>
            <p className="text-[11px] text-amber-100 mt-0.5">
              Rp {((farmSettings?.pricePerKwintalEid ?? 80_000_000) / 1_000_000).toFixed(0)} Jt / Kwintal
            </p>
          </div>

          <div className="rounded-xl bg-white/90 border border-emerald-200 p-3.5 text-center shadow-2xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Tambahan Margin Kurban
            </p>
            <p className="text-xl font-extrabold text-emerald-700 mt-1">
              +{formatRupiah(selisihHarga)}
            </p>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              Potensi keuntungan momentum
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Growth Trajectory & Early Health Screening */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SectionCard
            title="Kurva Pertumbuhan & Proyeksi Kurban"
            subtitle="Riwayat penimbangan & garis target harian"
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
            title="Kesehatan Sapi"
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
                  Evaluasi Sistem Pakar
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-900">
                  {healthStatus.summary}
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
        title={`Menu Pakan Hari Ini — ${profile.name}`}
        subtitle={`Bobot ${formatKg(profile.currentWeightKg, 1)} • target naik ${optimizationResult.adgRequiredKg.toFixed(2)} kg/hari`}
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
