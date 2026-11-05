"use client";

import React from "react";
import { RefreshCw, Scale, UtensilsCrossed } from "lucide-react";

interface AnomalySignalInputsProps {
  penurunanPakanPercent: number;
  penurunanBobotPercent: number;
  autoDetectedWeightDropPercent: number;
  onChangePakanDrop: (val: number) => void;
  onChangeBobotDrop: (val: number) => void;
}

export function AnomalySignalInputs({
  penurunanPakanPercent,
  penurunanBobotPercent,
  autoDetectedWeightDropPercent,
  onChangePakanDrop,
  onChangeBobotDrop,
}: AnomalySignalInputsProps) {
  const isPakanAlert = penurunanPakanPercent > 20;
  const isBobotAlert = penurunanBobotPercent > 2;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Sinyal 1: Penurunan Konsumsi Pakan */}
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          isPakanAlert
            ? "border-amber-300 bg-amber-50/70"
            : "border-slate-200 bg-slate-50/50"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 sm:text-sm">
                Penurunan Konsumsi Pakan (2 Hari)
              </h4>
              <p className="text-[11px] text-slate-500">
                Anomali aktif jika sisa pakan &gt;20% (+25 poin)
              </p>
            </div>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-extrabold ${
              isPakanAlert
                ? "bg-amber-200 text-amber-900"
                : "bg-slate-200/70 text-slate-700"
            }`}
          >
            {penurunanPakanPercent}%
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={penurunanPakanPercent}
          onChange={(e) => onChangePakanDrop(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
        />

        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>0% (Habis Normal)</span>
          <span className="font-semibold text-amber-700">Batas &gt;20%</span>
          <span>100% (Mogok Makan)</span>
        </div>
      </div>

      {/* Sinyal 2: Penurunan Bobot Badan Mingguan */}
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          isBobotAlert
            ? "border-amber-300 bg-amber-50/70"
            : "border-slate-200 bg-slate-50/50"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 sm:text-sm">
                Penurunan Bobot Mingguan
              </h4>
              <p className="text-[11px] text-slate-500">
                Anomali aktif jika bobot susut &gt;2% (+20 poin)
              </p>
            </div>
          </div>
          <span
            className={`rounded-lg px-2 py-0.5 text-xs font-extrabold ${
              isBobotAlert
                ? "bg-amber-200 text-amber-900"
                : "bg-slate-200/70 text-slate-700"
            }`}
          >
            {penurunanBobotPercent}%
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={15}
          step={0.5}
          value={penurunanBobotPercent}
          onChange={(e) => onChangeBobotDrop(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
        />

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>0% (Stabil/Naik)</span>
          {autoDetectedWeightDropPercent > 0 ? (
            <button
              type="button"
              onClick={() => onChangeBobotDrop(autoDetectedWeightDropPercent)}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Isi dari Log ({autoDetectedWeightDropPercent}%)
            </button>
          ) : (
            <span className="font-semibold text-amber-700">Batas &gt;2%</span>
          )}
          <span>15%</span>
        </div>
      </div>
    </div>
  );
}

