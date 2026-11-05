"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { CattleProfile } from "@/types";

interface DeleteCattleModalProps {
  cattle: CattleProfile | null;
  onClose: () => void;
  onConfirmDelete: (cattle: CattleProfile) => void;
}

export function DeleteCattleModal({
  cattle,
  onClose,
  onConfirmDelete,
}: DeleteCattleModalProps) {
  if (!cattle) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Hapus Data Hewan Ternak?
              </h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan menghapus profil dan riwayat timbangan sapi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-950">
          Anda yakin ingin menghapus{" "}
          <strong className="font-bold">{cattle.name}</strong> ({cattle.breed}
          {cattle.earTag ? ` • ${cattle.earTag}` : ""}) beserta{" "}
          <strong>{cattle.weightLogs.length} catatan timbangan</strong> dari
          daftar kandang?
        </div>

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(cattle);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
          >
            <Trash2 className="h-4 w-4" />
            <span>Ya, Hapus Sapi</span>
          </button>
        </div>
      </div>
    </div>
  );
}

