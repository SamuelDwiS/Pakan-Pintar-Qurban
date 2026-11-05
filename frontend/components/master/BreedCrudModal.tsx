"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dna, Save, X } from "lucide-react";
import type { BreedItem } from "@/types";

interface BreedFormValues {
  name: string;
  code: string;
  normalAdgKg: number;
  maxBiologicalAdgKg: number;
  description: string;
}

interface BreedCrudModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: BreedItem | null;
  onClose: () => void;
  onSubmitBreed: (values: Omit<BreedItem, "id">) => void;
}

export function BreedCrudModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmitBreed,
}: BreedCrudModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BreedFormValues>({
    defaultValues: {
      name: "",
      code: "",
      normalAdgKg: 1.0,
      maxBiologicalAdgKg: 1.35,
      description: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        code: initialData.code,
        normalAdgKg: initialData.normalAdgKg,
        maxBiologicalAdgKg: initialData.maxBiologicalAdgKg,
        description: initialData.description || "",
      });
    } else {
      reset({
        name: "",
        code: "",
        normalAdgKg: 1.0,
        maxBiologicalAdgKg: 1.35,
        description: "",
      });
    }
  }, [isOpen, mode, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = (values: BreedFormValues) => {
    onSubmitBreed({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      normalAdgKg: Number(values.normalAdgKg),
      maxBiologicalAdgKg: Number(values.maxBiologicalAdgKg),
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Dna className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === "create"
                  ? "Tambah Master Bangsa / Ras Sapi"
                  : `Edit Bangsa: ${initialData?.name}`}
              </h3>
              <p className="text-xs text-slate-500">
                Parameter batas biologis PBBH untuk validasi AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700">
                Nama Bangsa / Ras Sapi *
              </label>
              <input
                type="text"
                placeholder="Contoh: Sapi Aceh / Pasundan"
                {...register("name", { required: "Nama ras wajib diisi" })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kode *
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="ACH"
                {...register("code", { required: true })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                PBBH Normal (kg/hari) *
              </label>
              <input
                type="number"
                step="0.05"
                min={0.2}
                max={2.5}
                {...register("normalAdgKg", { required: true, min: 0.2 })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Batas Biologis Maks (kg/hr) *
              </label>
              <input
                type="number"
                step="0.05"
                min={0.3}
                max={3.0}
                {...register("maxBiologicalAdgKg", { required: true, min: 0.3 })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Karakteristik Genetik &amp; Pakan
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Adaptif pakan hijauan lokal, karkas padat..."
              {...register("description")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Bangsa Sapi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

