"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Calculator,
  ClipboardList,
  History,
  Scale,
  Tag,
  Trash2,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { HealthBadge } from "@/components/HealthBadge";
import { CattleProfileForm } from "@/components/profil/CattleProfileForm";
import { WeightLogManager } from "@/components/profil/WeightLogManager";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { SectionCard } from "@/components/ui/SectionCard";
import { WeightChart } from "@/components/WeightChart";
import type {
  CattleProfile,
  HealthStatus,
  OptimizationResult,
  WeightLogEntry,
} from "@/types";

interface CattleDetailViewProps {
  cattle: CattleProfile;
  barnName?: string;
  daysToQurban: number;
  optimizationResult: OptimizationResult;
  healthStatus: HealthStatus;
  onBackToList: () => void;
  onSaveProfile: (patch: Partial<CattleProfile>) => Promise<void>;
  onAddWeightLog: (entry: Omit<WeightLogEntry, "id">) => Promise<void>;
  onRemoveWeightLog: (logId: string) => Promise<void>;
  onRequestDelete: (cattle: CattleProfile) => void;
}

export function CattleDetailView({
  cattle,
  barnName,
  daysToQurban,
  optimizationResult,
  healthStatus,
  onBackToList,
  onSaveProfile,
  onAddWeightLog,
  onRemoveWeightLog,
  onRequestDelete,
}: CattleDetailViewProps) {
  const maxBio = optimizationResult.maxBiologicalAdgKg ?? 1.5;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToList}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-emerald-800 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Hewan Ternak</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/ransum"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Ransum Sapi Ini</span>
          </Link>

          <Link
            href="/kesehatan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            <span>Skrining PMK</span>
          </Link>

          <button
            type="button"
            onClick={() => onRequestDelete(cattle)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Sapi</span>
          </button>
        </div>
      </div>

      {/* Cattle Detail Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/60 p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              Detail Profil Ternak
            </span>
            {barnName && (
              <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-0.5 text-xs font-bold text-emerald-900 ring-1 ring-inset ring-emerald-200">
                <Warehouse className="h-3.5 w-3.5 text-emerald-700" />
                <span>
                  {barnName}
                  {cattle.stallNumber ? ` • ${cattle.stallNumber}` : ""}
                </span>
              </span>
            )}
            <HealthBadge status={healthStatus} variant="compact" />
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {cattle.name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 sm:text-sm">
            <span>{cattle.breed}</span>
            {cattle.earTag && (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Tag className="h-3.5 w-3.5" />
                {cattle.earTag}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-right shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">
            Countdown &amp; Target PBBH
          </p>
          <p className="text-lg font-extrabold text-emerald-900">
            {daysToQurban} Hari &bull;{" "}
            {optimizationResult.adgRequiredKg.toFixed(2)} kg/hr
          </p>
        </div>
      </div>

      {!optimizationResult.isAdgFeasible && (
        <InfoAlert
          variant="warning"
          title={`Target PBBH Melebihi Batas Biologis ${cattle.breed} (>${maxBio} kg/hari)`}
          description={
            optimizationResult.warningMessage ||
            "Target pertambahan bobot harian terlalu tinggi. Disarankan menyesuaikan target bobot kurban atau memperpanjang durasi penggemukan."
          }
        />
      )}

      {/* Profile Form + Growth Trajectory Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionCard
            title="Edit Identitas, Lokasi Kandang & Target"
            subtitle="Perubahan pada form ini langsung tersimpan pada sapi terkait"
            icon={<ClipboardList className="h-5 w-5" />}
          >
            <CattleProfileForm profile={cattle} onSave={onSaveProfile} />
          </SectionCard>
        </div>

        <div className="lg:col-span-7">
          <SectionCard
            title="Kurva Pertumbuhan & Target Harian"
            subtitle={`Proyeksi bobot berkala untuk ${cattle.name}`}
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <WeightChart profile={cattle} />
          </SectionCard>
        </div>
      </div>

      {/* Weight Logs Manager */}
      <SectionCard
        title={`Riwayat Timbangan Berkala — ${cattle.name}`}
        subtitle="Catat hasil timbangan rutin untuk memperbarui estimasi PBBH dan kurva regresi pertumbuhan"
        icon={<History className="h-5 w-5" />}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Scale className="h-3.5 w-3.5" />
            {cattle.weightLogs.length} Catatan
          </span>
        }
      >
        <WeightLogManager
          logs={cattle.weightLogs}
          profile={cattle}
          optimizationResult={optimizationResult}
          onAddLog={onAddWeightLog}
          onRemoveLog={onRemoveWeightLog}
        />
      </SectionCard>
    </div>
  );
}
