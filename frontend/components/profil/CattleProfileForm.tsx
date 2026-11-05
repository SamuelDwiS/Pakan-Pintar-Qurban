"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Save } from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import type { CattleProfile } from "@/types";

interface ProfileFormValues {
  name: string;
  barnId: string;
  stallNumber: string;
  breed: string;
  earTag: string;
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startDate: string;
  targetDateQurban: string;
}

interface CattleProfileFormProps {
  profile: CattleProfile;
  onSave: (patch: Partial<CattleProfile>) => Promise<void>;
}

export function CattleProfileForm({ profile, onSave }: CattleProfileFormProps) {
  const { barns, breeds } = useAppState();
  const [savedToast, setSavedToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: profile.name,
      barnId: profile.barnId,
      stallNumber: profile.stallNumber || "",
      breed: profile.breed,
      earTag: profile.earTag || "",
      initialWeightKg: profile.initialWeightKg,
      currentWeightKg: profile.currentWeightKg,
      targetWeightKg: profile.targetWeightKg,
      startDate: profile.startDate,
      targetDateQurban: profile.targetDateQurban,
    },
  });

  useEffect(() => {
    reset({
      name: profile.name,
      barnId: profile.barnId,
      stallNumber: profile.stallNumber || "",
      breed: profile.breed,
      earTag: profile.earTag || "",
      initialWeightKg: profile.initialWeightKg,
      currentWeightKg: profile.currentWeightKg,
      targetWeightKg: profile.targetWeightKg,
      startDate: profile.startDate,
      targetDateQurban: profile.targetDateQurban,
    });
  }, [profile, reset]);

  const selectedBreed = watch("breed");
  const breedMeta = breeds.find((b) => b.name === selectedBreed);

  const onSubmit = async (values: ProfileFormValues) => {
    await onSave({
      name: values.name.trim() || profile.name,
      barnId: values.barnId,
      stallNumber: values.stallNumber.trim(),
      breed: values.breed,
      earTag: values.earTag.trim(),
      initialWeightKg: Number(values.initialWeightKg),
      currentWeightKg: Number(values.currentWeightKg),
      targetWeightKg: Number(values.targetWeightKg),
      startDate: values.startDate,
      targetDateQurban: values.targetDateQurban,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Kode / Nama Sapi
          </label>
          <input
            type="text"
            placeholder="Contoh: Sapi 1 atau Si Putih"
            {...register("name", { required: "Identitas sapi wajib diisi" })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Ciri Fisik / Ear Tag (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Kepala putih • Tag #014"
            {...register("earTag")}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Lokasi Kandang
          </label>
          <select
            {...register("barnId")}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          >
            {barns.map((barn) => (
              <option key={barn.id} value={barn.id}>
                {barn.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Nomor Patok / Sekat
          </label>
          <input
            type="text"
            placeholder="Contoh: Patok 01"
            {...register("stallNumber")}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700">
            Bangsa / Jenis Sapi Potong
          </label>
          <select
            {...register("breed")}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          >
            {breeds.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
          {breedMeta && (
            <p className="mt-1 text-xs text-slate-500">
              PBBH normal: <strong>{breedMeta.normalAdgKg} kg/hari</strong>{" "}
              (Batas biologis maks: {breedMeta.maxBiologicalAdgKg} kg/hari).
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Bobot Awal Penggemukan (kg)
          </label>
          <input
            type="number"
            step="0.5"
            {...register("initialWeightKg", {
              required: "Wajib diisi",
              min: { value: 80, message: "Minimal 80 kg" },
              max: { value: 1200, message: "Maksimal 1200 kg" },
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Bobot Saat Ini (kg)
          </label>
          <input
            type="number"
            step="0.5"
            {...register("currentWeightKg", {
              required: "Wajib diisi",
              min: { value: 80, message: "Minimal 80 kg" },
              max: { value: 1200, message: "Maksimal 1200 kg" },
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Target Bobot Kurban (kg)
          </label>
          <input
            type="number"
            step="1"
            {...register("targetWeightKg", {
              required: "Wajib diisi",
              min: { value: 150, message: "Minimal 150 kg" },
              max: { value: 1500, message: "Maksimal 1500 kg" },
            })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700">
            Target Tanggal Idul Adha
          </label>
          <input
            type="date"
            {...register("targetDateQurban", { required: "Wajib dipilih" })}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {savedToast ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4" />
            Profil, lokasi kandang &amp; kalkulasi ransum berhasil diperbarui!
          </span>
        ) : (
          <span className="text-xs text-slate-500">
            Perubahan target otomatis menghitung ulang kebutuhan nutrisi harian.
          </span>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-60 sm:w-auto"
        >
          <Save className="h-4 w-4" />
          <span>{isSubmitting ? "Menyimpan..." : "Simpan Profil & Target"}</span>
        </button>
      </div>
    </form>
  );
}
