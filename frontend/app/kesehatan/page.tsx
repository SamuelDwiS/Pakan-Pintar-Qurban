"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
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
    <div className="space-y-6">
      {/* Quick Multi-Cattle Switcher */}
      <CattleSelectorBar />

      {/* Page Header & Quick Simulation Buttons */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            AI Engine 3 &bull; Sistem Pakar Mandiri KIAT VETINDO PMK Kementan RI
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Skrining Dini Kesehatan Ternak
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            AI mengevaluasi gejala klinis &amp; anomali pakan secara mandiri,
            serta menyiapkan laporan darurat WhatsApp 1-klik jika berisiko PMK.
          </p>
        </div>

        {/* Tombol Simulasi Cepat untuk Demo Kompetisi */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-slate-500">
            Uji Cepat:
          </span>
          <button
            type="button"
            onClick={() => applyDemoPreset("sehat")}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
          >
            Hijau (Sehat)
          </button>
          <button
            type="button"
            onClick={() => applyDemoPreset("waspada")}
            className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
          >
            Kuning (Waspada)
          </button>
          <button
            type="button"
            onClick={() => applyDemoPreset("pmk")}
            className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
          >
            Merah (Indikasi PMK)
          </button>
        </div>
      </div>

      {/* Hasil Skrining Aktif + Laporan WA 1-Klik */}
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
        vetClinicName={farmSettings.vetClinicName}
        vetWhatsappNumber={farmSettings.vetWhatsappNumber}
      />

      {/* Form Pemeriksaan Gejala Visual & Sinyal Data */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard
          title="1. Checklist Gejala Klinis Visual"
          subtitle="Ketuk pada gejala yang terlihat pada mulut, kuku, atau perilaku sapi hari ini"
          icon={<Stethoscope className="h-5 w-5" />}
          action={
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Pratinjau Skor: {livePreview.totalScore} poin (
              {livePreview.riskLevel})
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          title="2. Deteksi Sinyal Anomali Data Harian"
          subtitle="Penurunan konsumsi pakan atau susut bobot mendadak merupakan indikator awal infeksi sebelum gejala klinis muncul"
          icon={<Activity className="h-5 w-5" />}
        >
          <div className="space-y-5">
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-500">
                Ternak diperiksa:{" "}
                <strong className="text-slate-800">
                  {profile.name}
                  {activeBarnName ? ` (${activeBarnName})` : ""}
                </strong>
              </div>

              <button
                type="submit"
                disabled={isScreening}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-60 sm:w-auto"
              >
                <ClipboardCheck className="h-4 w-4" />
                <span>
                  {isScreening
                    ? "Mengevaluasi Risiko..."
                    : "Simpan & Evaluasi Status Kesehatan"}
                </span>
              </button>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* Riwayat Pemeriksaan Terakhir */}
      <SectionCard
        title="Riwayat Pemeriksaan Kesehatan"
        subtitle="Catatan skrining terbaru yang tersimpan pada perangkat"
        icon={<History className="h-5 w-5" />}
      >
        <div className="divide-y divide-slate-100">
          {healthHistory.map((item, idx) => (
            <div
              key={`${item.checkedAt}-${idx}`}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-2.5">
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
                <div>
                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
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
