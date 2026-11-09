"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  History,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { AnomalySignalInputs } from "@/components/kesehatan/AnomalySignalInputs";
import { SymptomCheckCard } from "@/components/kesehatan/SymptomCheckCard";
import { HealthBadge } from "@/components/HealthBadge";
import { CattleSelectorBar } from "@/components/ui/CattleSelectorBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAppState } from "@/context/AppStateContext";
import { CLINICAL_SYMPTOMS } from "@/lib/constants";
import { evaluateHealthFallback } from "@/lib/fallback-engines";
import { formatDateTimeId } from "@/lib/formatters";
import type { HealthChecklistForm } from "@/types";

export default function KesehatanPage() {
  const {
    currentUser,
    barns,
    farmSettings,
    profile,
    healthStatus,
    healthHistory,
    isScreening,
    runHealthScreening,
  } = useAppState();

  const activeBarnName = barns.find((b) => b.id === profile.barnId)?.name;

  const [formState, setFormState] = useState<HealthChecklistForm>({
    cattleId: profile.id,
    airLiurBerlebih: false,
    lepuhMulutKaki: false,
    pincang: false,
    demam: false,
    diare: false,
    penurunanPakanPercent: 0,
    penurunanBobotPercent: 0,
    catatanTambahan: "",
  });

  // Deteksi otomatis persentase penurunan bobot dari 2 catatan timbangan terakhir
  const autoDetectedWeightDropPercent = useMemo(() => {
    const sorted = [...profile.weightLogs].sort((a, b) =>
      a.date.localeCompare(b.date)
    );
    if (sorted.length < 2) return 0;
    const prev = sorted[sorted.length - 2].weightKg;
    const latest = sorted[sorted.length - 1].weightKg;
    if (latest >= prev || prev <= 0) return 0;
    return Number((((prev - latest) / prev) * 100).toFixed(1));
  }, [profile.weightLogs]);

  // Pratinjau skor langsung saat form diubah
  const livePreview = useMemo(
    () => evaluateHealthFallback({ ...formState, cattleId: profile.id }),
    [formState, profile.id]
  );

  const applyDemoPreset = async (preset: "sehat" | "waspada" | "pmk") => {
    const nextForm: HealthChecklistForm =
      preset === "sehat"
        ? {
            cattleId: profile.id,
            airLiurBerlebih: false,
            lepuhMulutKaki: false,
            pincang: false,
            demam: false,
            diare: false,
            penurunanPakanPercent: 0,
            penurunanBobotPercent: 0,
            catatanTambahan: "",
          }
        : preset === "waspada"
        ? {
            cattleId: profile.id,
            airLiurBerlebih: false,
            lepuhMulutKaki: false,
            pincang: false,
            demam: false,
            diare: false,
            penurunanPakanPercent: 25,
            penurunanBobotPercent: 1.0,
            catatanTambahan: "Nafsu makan berkurang sejak pagi.",
          }
        : {
            cattleId: profile.id,
            airLiurBerlebih: true,
            lepuhMulutKaki: true,
            pincang: false,
            demam: true,
            diare: false,
            penurunanPakanPercent: 35,
            penurunanBobotPercent: 2.5,
            catatanTambahan: "Mulut berbusa & luka pada celah kuku.",
          };

    setFormState(nextForm);
    await runHealthScreening(nextForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runHealthScreening({
      ...formState,
      cattleId: profile.id,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Quick Multi-Cattle Switcher */}
      <CattleSelectorBar />

      {/* Page Header & Quick Simulation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Pemeriksaan Kesehatan
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Cek Kesehatan &amp; Tanda Sakit
          </h1>
          <p className="text-xs text-slate-600">
            Periksa tanda fisik sapi untuk mendapatkan rekomendasi tindakan perawatan mandiri secara tepat.
          </p>
        </div>

        {/* Tombol Simulasi Cepat */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Uji Cepat:</span>
          <button
            type="button"
            onClick={() => applyDemoPreset("sehat")}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            🟢 Normal
          </button>
          <button
            type="button"
            onClick={() => applyDemoPreset("waspada")}
            className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            🟡 Waspada
          </button>
          <button
            type="button"
            onClick={() => applyDemoPreset("pmk")}
            className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-100"
          >
            🔴 Sakit PMK
          </button>
        </div>
      </div>

      {/* Hasil Skrining Aktif & Rekomendasi Tindakan Mandiri */}
      <HealthBadge
        status={healthStatus}
        variant="detailed"
        cattleName={`${profile.name} (${profile.breed})`}
        barnName={
          activeBarnName
            ? `${activeBarnName}${
                profile.stallNumber ? ` • ${profile.stallNumber}` : ""
              }`
            : undefined
        }
        farmName={currentUser?.farmName}
        vetContacts={farmSettings.vetContacts}
      />

      {/* Form Pemeriksaan Gejala Visual & Sinyal Data */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <SectionCard
          title="1. Tanda Fisik Sapi"
          subtitle="Centang gejala yang terlihat pada mulut, kuku, atau gaya berjalan sapi"
          icon={<Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />}
          action={
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
              Skor: {livePreview.totalScore} ({livePreview.riskLevel})
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CLINICAL_SYMPTOMS.map((symptom) => (
              <SymptomCheckCard
                key={symptom.key}
                symptom={symptom}
                checked={formState[symptom.key]}
                onToggle={(checked) =>
                  setFormState((prev) => ({
                    ...prev,
                    [symptom.key]: checked,
                  }))
                }
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="2. Nafsu Makan & Bobot"
          subtitle="Deteksi awal jika pakan bersisa banyak atau bobot sapi susut"
          icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          <AnomalySignalInputs
            penurunanPakanPercent={formState.penurunanPakanPercent}
            penurunanBobotPercent={formState.penurunanBobotPercent}
            autoDetectedWeightDropPercent={autoDetectedWeightDropPercent}
            onChangePakanDrop={(val) =>
              setFormState((prev) => ({
                ...prev,
                penurunanPakanPercent: val,
              }))
            }
            onChangeBobotDrop={(val) =>
              setFormState((prev) => ({
                ...prev,
                penurunanBobotPercent: val,
              }))
            }
          />
        </SectionCard>

        {/* 3. Catatan Gejala Tambahan (Keluhan Bebas) */}
        <SectionCard
          title="3. Catatan Gejala Lainnya (Opsional)"
          subtitle="Jika ada tanda sakit lain yang tidak ada di menu di atas"
          icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          <div className="space-y-3">
            <textarea
              rows={2}
              value={formState.catatanTambahan || ""}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  catatanTambahan: e.target.value,
                }))
              }
              placeholder="Contoh: perut kiri kembung kencang, batuk berdahak, mata berair/keruh, benjolan kulit..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Catatan ini berguna untuk riwayat harian atau bahan konsultasi langsung saat mantri langganan datang ke kandang.
            </p>
          </div>
        </SectionCard>

        {/* Tombol Simpan & Evaluasi */}
        <div className="sticky bottom-16 z-20 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur-md sm:static sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600 hidden sm:block">
              Sapi diperiksa: <strong>{profile.name}</strong>
              {activeBarnName ? ` (${activeBarnName})` : ""}
            </div>

            <button
              type="submit"
              disabled={isScreening}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60 sm:w-auto"
            >
              <ClipboardCheck className="h-5 w-5" />
              <span>
                {isScreening
                  ? "Mengevaluasi..."
                  : `Simpan & Cek Kesehatan (${profile.name})`}
              </span>
            </button>
          </div>
        </div>
      </form>

      {/* Riwayat Pemeriksaan Terakhir */}
      <SectionCard
        title="Riwayat Pemeriksaan"
        subtitle="Catatan pemeriksaan sebelumnya"
        icon={<History className="h-4 w-4 sm:h-5 sm:w-5" />}
      >
        <div className="divide-y divide-slate-100">
          {healthHistory.map((item, idx) => (
            <div
              key={`${item.checkedAt}-${idx}`}
              className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {item.riskLevel === "MERAH" ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.riskLevel === "KUNING"
                        ? "text-amber-500"
                        : "text-emerald-600"
                    }`}
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {item.summary}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {formatDateTimeId(item.checkedAt)}
                  </p>
                </div>
              </div>
              <HealthBadge status={item} variant="compact" />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
