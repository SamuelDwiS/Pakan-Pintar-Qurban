"use client";

import React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Activity,
  AlertTriangle,
  Calculator,
  Plus,
  ShieldAlert,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatIndonesianDate, formatKg } from "@/lib/formatters";
import type { CattleProfile, OptimizationResult, WeightLogEntry } from "@/types";

interface LogFormValues {
  date: string;
  weightKg: number;
  note: string;
}

interface WeightLogManagerProps {
  logs: WeightLogEntry[];
  profile?: CattleProfile;
  optimizationResult?: OptimizationResult;
  onAddLog: (entry: Omit<WeightLogEntry, "id">) => Promise<void>;
  onRemoveLog: (id: string) => Promise<void>;
}

export function WeightLogManager({
  logs,
  profile,
  optimizationResult,
  onAddLog,
  onRemoveLog,
}: WeightLogManagerProps) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const latestLog = sortedLogs[sortedLogs.length - 1];
  const prevLog = sortedLogs.length >= 2 ? sortedLogs[sortedLogs.length - 2] : null;
  const lastWeight = latestLog?.weightKg ?? 325;
  const latestDiff = prevLog && latestLog ? Number((latestLog.weightKg - prevLog.weightKg).toFixed(1)) : 0;
  const hasLatestDrop = latestDiff < 0;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFormValues>({
    defaultValues: {
      date: todayIso,
      weightKg: Number((lastWeight + 5).toFixed(1)),
      note: "",
    },
  });

  const watchedWeight = watch("weightKg");
  const isInputDropping = Boolean(
    watchedWeight &&
      !isNaN(Number(watchedWeight)) &&
      Number(watchedWeight) < lastWeight
  );

  const onSubmit = async (values: LogFormValues) => {
    await onAddLog({
      date: values.date,
      weightKg: Number(values.weightKg),
      note: values.note.trim() || "Penimbangan berkala",
    });
    reset({
      date: todayIso,
      weightKg: Number((Number(values.weightKg) + 5).toFixed(1)),
      note: "",
    });
  };

  return (
    <div className="space-y-5">
      {/* Banner Anomali Penurunan Bobot Aktual (Ground-Truth Calibration) */}
      {hasLatestDrop && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 sm:p-5 text-amber-950 shadow-xs space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">
                ⚠️ Anomali Terdeteksi: Bobot Terkini Turun {Math.abs(latestDiff)} kg
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Timbangan terakhir pada <strong>{formatIndonesianDate(latestLog.date)}</strong> ({latestLog.weightKg} kg) turun dari catatan sebelumnya ({prevLog?.weightKg} kg).
                {optimizationResult && (
                  <span>
                    {" "}Sistem AI telah mengkalibrasi ulang kebutuhan target PBBH menjadi <strong>{optimizationResult.adgRequiredKg.toFixed(2)} kg/hari</strong>.
                  </span>
                )}
              </p>
            </div>
          </div>

          {optimizationResult && !optimizationResult.isAdgFeasible && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-900">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Batas Biologis Terlampaui ({optimizationResult.adgRequiredKg.toFixed(2)} kg/hari &gt; {optimizationResult.maxBiologicalAdgKg ?? 1.5} kg/hari):</p>
                  <p className="mt-0.5 leading-relaxed">
                    Karena bobot sempat turun, target PBBH untuk mengejar bobot kurban menjadi di luar batas biologis aman ras {profile?.breed || "sapi"}. Sangat disarankan menurunkan target bobot akhir di profil atau menambah waktu penggemukan agar ternak tidak dipaksa pakan konsentrat berlebih yang berisiko asidosis/bloat.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              href="/kesehatan"
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 transition-colors"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Skrining PMK &amp; Nafsu Makan</span>
            </Link>
            <Link
              href="/ransum"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <Calculator className="h-3.5 w-3.5 text-amber-700" />
              <span>Cek Formulasi Ransum Terkini</span>
            </Link>
          </div>
        </div>
      )}

      {/* Form Tambah Timbangan */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Tambah Catatan Timbangan Mingguan / Berkala
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Tanggal Timbang
            </label>
            <input
              type="date"
              {...register("date", { required: "Pilih tanggal" })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Hasil Bobot (kg)
            </label>
            <input
              type="number"
              step="0.1"
              {...register("weightKg", {
                required: "Masukkan bobot",
                min: { value: 50, message: "Min 50 kg" },
              })}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            {errors.weightKg && (
              <p className="mt-0.5 text-[11px] text-rose-600">
                {errors.weightKg.message}
              </p>
            )}
            {isInputDropping && (
              <p className="mt-1 text-[11px] font-medium text-amber-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Bobot lebih rendah dari data sebelumnya ({lastWeight} kg). AI akan mengaktifkan deteksi anomali.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Catatan Kondisi (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: Nafsu makan bagus / sedikit lesu"
              {...register("note")}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Log Timbangan</span>
          </button>
        </div>
      </form>

      {/* Daftar Riwayat Timbangan */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 text-right">Bobot (kg)</th>
                <th className="px-4 py-3 text-right">Perubahan</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {[...sortedLogs].reverse().map((log, revIdx, revArr) => {
                const prevLogEntry = revArr[revIdx + 1];
                const diff = prevLogEntry
                  ? Number((log.weightKg - prevLogEntry.weightKg).toFixed(1))
                  : 0;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-800 sm:text-sm">
                      {formatIndonesianDate(log.date)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatKg(log.weightKg, 1)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-semibold">
                      {!prevLogEntry ? (
                        <span className="text-slate-400">Awal</span>
                      ) : diff >= 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <TrendingUp className="h-3.5 w-3.5" />+{diff} kg
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
                          <TrendingDown className="h-3.5 w-3.5" />
                          {diff} kg (Anomali)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {log.note || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={sortedLogs.length <= 1}
                        onClick={() => onRemoveLog(log.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                        title="Hapus catatan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

