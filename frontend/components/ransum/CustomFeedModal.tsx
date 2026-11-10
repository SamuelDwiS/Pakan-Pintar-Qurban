"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, X } from "lucide-react";
import type { FeedItem } from "@/types";

interface CustomFeedFormValues {
  name: string;
  category: FeedItem["category"];
  bkPercent: number;
  pkPercent: number;
  tdnPercent: number;
  maxLimitKg: number;
  pricePerKg: number;
}

interface CustomFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (feed: Omit<FeedItem, "id">) => void;
}

export function CustomFeedModal({
  isOpen,
  onClose,
  onAdd,
}: CustomFeedModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomFeedFormValues>({
    defaultValues: {
      name: "",
      category: "Limbah Pertanian",
      bkPercent: 86,
      pkPercent: 10,
      tdnPercent: 65,
      maxLimitKg: 4,
      pricePerKg: 1500,
    },
  });

  if (!isOpen) return null;

  const onSubmit = (values: CustomFeedFormValues) => {
    onAdd({
      name: values.name.trim(),
      category: values.category,
      bkPercent: Number(values.bkPercent),
      pkPercent: Number(values.pkPercent),
      tdnPercent: Number(values.tdnPercent),
      maxLimitKg: Number(values.maxLimitKg),
      pricePerKg: Number(values.pricePerKg),
      isActive: true,
      isCustom: true,
    });
    reset();
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
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Tambah Bahan Pakan Lokal Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Bahan Pakan
            </label>
            <input
              type="text"
              placeholder="Contoh: Onggok Singkong / Jerami Fermentasi"
              {...register("name", { required: "Nama pakan wajib diisi" })}
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
              Kategori Pakan
            </label>
            <select
              {...register("category")}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="Hijauan">Hijauan</option>
              <option value="Konsentrat">Konsentrat</option>
              <option value="Limbah Pertanian">Limbah Pertanian</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                BK (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("bkPercent", { required: true, min: 5, max: 100 })}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                PK (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("pkPercent", { required: true, min: 1, max: 60 })}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                TDN (%)
              </label>
              <input
                type="number"
                step="0.1"
                {...register("tdnPercent", {
                  required: true,
                  min: 20,
                  max: 95,
                })}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Harga per kg (Rp)
              </label>
              <input
                type="number"
                step="50"
                {...register("pricePerKg", { required: true, min: 0 })}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Stok Tersedia (kg/hari)
              </label>
              <input
                type="number"
                step="0.5"
                {...register("maxLimitKg", { required: true, min: 0 })}
                onFocus={(e) => e.target.select()}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Simpan Bahan Pakan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

