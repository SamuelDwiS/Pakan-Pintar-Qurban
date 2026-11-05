"use client";

import React from "react";
import { Check } from "lucide-react";
import type { ClinicalSymptomMeta } from "@/lib/constants";

interface SymptomCheckCardProps {
  symptom: ClinicalSymptomMeta;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export function SymptomCheckCard({
  symptom,
  checked,
  onToggle,
}: SymptomCheckCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!checked)}
      className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
        checked
          ? symptom.isCritical
            ? "border-rose-400 bg-rose-50/80 ring-2 ring-rose-500/20"
            : "border-amber-400 bg-amber-50/70 ring-2 ring-amber-500/20"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          checked
            ? symptom.isCritical
              ? "border-rose-600 bg-rose-600 text-white"
              : "border-amber-600 bg-amber-600 text-white"
            : "border-slate-300 bg-white text-transparent"
        }`}
      >
        <Check className="h-4 w-4 stroke-[3]" />
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">
            {symptom.title}
          </span>
          <div className="flex items-center gap-1.5">
            {symptom.isCritical && (
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                Gejala Utama PMK
              </span>
            )}
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              +{symptom.score} poin
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          {symptom.description}
        </p>
      </div>
    </button>
  );
}

