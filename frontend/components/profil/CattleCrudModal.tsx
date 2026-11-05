"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import {
  type CattleFormInput,
  useAppState,
} from "@/context/AppStateContext";
import { calculateDaysToQurban } from "@/lib/fallback-engines";
import type { CattleProfile } from "@/types";

interface CattleCrudModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: CattleProfile | null;
  defaultBarnId?: string;
  onClose: () => void;
  onSubmitCattle: (values: CattleFormInput) => Promise<void>;
}

export function CattleCrudModal({
  isOpen,
  mode,
  initialData,
  defaultBarnId,
  onClose,
  onSubmitCattle,
}: CattleCrudModalProps) {
  const { barns, breeds, farmSettings, getNextDefaultCattleName } =
    useAppState();
  const todayIso = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CattleFormInput>({
    defaultValues: {
      name: "",
      barnId: barns[0]?.id || "kandang-a",
      stallNumber: "",
      breed: breeds[0]?.name || "Simental Cross",
      earTag: "",
      initialWeightKg: 300,
      currentWeightKg: 300,
      targetWeightKg: 460,
      startDate: todayIso,
      targetDateQurban: farmSettings.defaultTargetDateQurban,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        barnId: initialData.barnId || barns[0]?.id || "kandang-a",
        stallNumber: initialData.stallNumber || "",
        breed: initialData.breed,
        earTag: initialData.earTag || "",
        initialWeightKg: initialData.initialWeightKg,
        currentWeightKg: initialData.currentWeightKg,
        targetWeightKg: initialData.targetWeightKg,
        startDate: initialData.startDate,
        targetDateQurban: initialData.targetDateQurban,
      });
    } else {
      reset({
        name: getNextDefaultCattleName(),
        barnId: defaultBarnId || barns[0]?.id || "kandang-a",
        stallNumber: "",
        breed: breeds[0]?.name || "Simental Cross",
        earTag: "",
        initialWeightKg: 300,
        currentWeightKg: 300,
        targetWeightKg: 460,
        startDate: todayIso,
        targetDateQurban: farmSettings.defaultTargetDateQurban,
      });
    }
  }, [
    isOpen,
    mode,
    initialData,
    defaultBarnId,
    barns,
    breeds,
    farmSettings.defaultTargetDateQurban,
    getNextDefaultCattleName,
    reset,
    todayIso,
  ]);

  if (!isOpen) return null;

  const watchedCurrent = Number(watch("currentWeightKg") || 0);
  const watchedTarget = Number(watch("targetWeightKg") || 0);
  const watchedTargetDate =
    watch("targetDateQurban") || farmSettings.defaultTargetDateQurban;
  const watchedBreed = watch("breed");
  const breedMeta = breeds.find((b) => b.name === watchedBreed);
  const maxBioAdg = breedMeta?.maxBiologicalAdgKg ?? 1.5;

  const daysLeft = calculateDaysToQurban(watchedTargetDate);
  const previewAdg = Number(
    (Math.max(0, watchedTarget - watchedCurrent) / daysLeft).toFixed(2)
  );
  const isFeasible = previewAdg <= maxBioAdg;

  const onSubmit = async (values: CattleFormInput) => {
    await onSubmitCattle({
      ...values,
      name: values.name?.trim() || getNextDefaultCattleName(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {mode === "create"
                  ? "Tambah Hewan Ternak (Sapi) Baru"
                  : `Edit Data Ternak: ${initialData?.name}`}
              </h3>
              <p className="text-xs text-slate-500">
                Nama otomatis dibuatkan nomor urut atau bebas dinamai sendiri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Nama Sapi (Otomatis / Bebas) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Kode / Nama Sapi (Otomatis jika dikosongkan)
                </label>
                {mode === "create" && (
                  <button
                    type="button"
                    onClick={() => setValue("name", getNextDefaultCattleName())}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Gunakan Nomor Urut</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder={`Otomatis: ${getNextDefaultCattleName()} (atau ketik nama panggilan sapi)`}
                {...register("name")}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Peternak banyak sapi cukup pakai{" "}
                <strong>{getNextDefaultCattleName()}</strong>, pemilik 1–2 sapi
                bebas memberi nama pribadi (misal: Si Putih / Bima).
              </p>
            </div>

            {/* Pilihan Kandang dari Master Kandang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lokasi Kandang (Data Master) *
              </label>
              <select
                {...register("barnId", { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {barns.map((barn) => (
                  <option key={barn.id} value={barn.id}>
                    {barn.name} ({barn.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Nomor Patok / Sekat */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nomor Patok / Sekat (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Patok 04 / Sekat Utara"
                {...register("stallNumber")}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {/* Bangsa Sapi dari Master Ras */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Bangsa / Ras Sapi (Data Master) *
              </label>
              <select
                {...register("breed")}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                {breeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              {breedMeta && (
                <p className="mt-1 text-[11px] text-slate-500">
                  PBBH normal: <strong>{breedMeta.normalAdgKg} kg/hr</strong>{" "}
                  (Maks: {breedMeta.maxBiologicalAdgKg} kg/hr)
                </p>
              )}
            </div>

            {/* Ciri Fisik / Ear Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Ciri Fisik / Ear Tag (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Coklat kaos kaki putih • #018"
                {...register("earTag")}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Bobot Awal Masuk (kg) *
              </label>
              <input
                type="number"
                step="0.5"
                {...register("initialWeightKg", {
                  required: "Wajib diisi",
                  min: { value: 80, message: "Minimal 80 kg" },
                })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              {errors.initialWeightKg && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.initialWeightKg.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Bobot Saat Ini (kg) *
              </label>
              <input
                type="number"
                step="0.5"
                {...register("currentWeightKg", {
                  required: "Wajib diisi",
                  min: { value: 80, message: "Minimal 80 kg" },
                })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              {errors.currentWeightKg && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.currentWeightKg.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Target Bobot Kurban (kg) *
              </label>
              <input
                type="number"
                step="1"
                {...register("targetWeightKg", {
                  required: "Wajib diisi",
                  min: { value: 150, message: "Minimal 150 kg" },
                })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              {errors.targetWeightKg && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.targetWeightKg.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Mulai Penggemukan
              </label>
              <input
                type="date"
                {...register("startDate", { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Target Tanggal Idul Adha *
              </label>
              <input
                type="date"
                {...register("targetDateQurban", { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Pratinjau Kelayakan Biologis Berdasarkan Master Ras Sapi */}
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
              isFeasible
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {isFeasible ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <div>
              <span className="font-bold">
                AI Validasi PBBH: {previewAdg} kg/hari ({daysLeft} hari menuju
                kurban)
              </span>
              <p className="mt-0.5 opacity-90">
                {isFeasible
                  ? `Realistis sesuai kapasitas genetik ${watchedBreed} (≤${maxBioAdg} kg/hari).`
                  : `Melebihi batas biologis ${watchedBreed} (~${maxBioAdg} kg/hari). Pertimbangkan menyesuaikan target bobot.`}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              <span>
                {mode === "create"
                  ? "Tambahkan Sapi ke Kandang"
                  : "Simpan Perubahan"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
