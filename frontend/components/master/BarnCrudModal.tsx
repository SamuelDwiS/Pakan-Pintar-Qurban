"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save, Warehouse, X } from "lucide-react";
import type { BarnItem, BarnType } from "@/types";

interface BarnFormValues {
  name: string;
  type: BarnType;
  capacity: number;
  locationNote: string;
}

interface BarnCrudModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: BarnItem | null;
  onClose: () => void;
  onSubmitBarn: (values: Omit<BarnItem, "id">) => void;
}

export function BarnCrudModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmitBarn,
}: BarnCrudModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BarnFormValues>({
    defaultValues: {
      name: "",
      type: "Individu / Tambat",
      capacity: 10,
      locationNote: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" && initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        capacity: initialData.capacity,
        locationNote: initialData.locationNote || "",
      });
    } else {
      reset({
        name: "",
        type: "Individu / Tambat",
        capacity: 10,
        locationNote: "",
      });
    }
  }, [isOpen, mode, initialData, reset]);

  if (!isOpen) return null;

  const onSubmit = (values: BarnFormValues) => {
    onSubmitBarn({
      name: values.name.trim(),
      type: values.type,
      capacity: Math.max(1, Number(values.capacity)),
      locationNote: values.locationNote.trim(),
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
              <Warehouse className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === "create"
                  ? "Tambah Blok Kandang Baru"
                  : `Edit Kandang: ${initialData?.name}`}
              </h3>
              <p className="text-xs text-slate-500">
                Data master lokasi penempatan sapi kurban
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
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Kandang / Blok *
            </label>
            <input
              type="text"
              placeholder="Contoh: Kandang Blok C / Kandang Timur"
              {...register("name", { required: "Nama kandang wajib diisi" })}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Sistem Kandang *
              </label>
              <select
                {...register("type")}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="Individu / Tambat">Individu / Tambat</option>
                <option value="Koloni">Koloni (Kelompok)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kapasitas Maksimal (Ekor) *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                {...register("capacity", {
                  required: "Wajib diisi",
                  min: { value: 1, message: "Minimal 1 ekor" },
                })}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Catatan Lokasi / Peruntukan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Dekat gudang pakan, khusus sapi siap jual"
              {...register("locationNote")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
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
              <span>Simpan Data Kandang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

