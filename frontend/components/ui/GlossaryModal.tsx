"use client";

import React from "react";
import { BookOpen, X } from "lucide-react";
import { NUTRIENT_GLOSSARY } from "@/lib/constants";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Panduan Istilah Pakan & Ternak
              </h3>
              <p className="text-xs text-slate-500">
                Penjelasan sederhana istilah nutrisi untuk peternak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup panduan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {NUTRIENT_GLOSSARY.map((item) => (
            <div
              key={item.term}
              className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="text-sm font-bold text-emerald-800">
                  {item.term}
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {item.short}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 sm:w-auto"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
}

