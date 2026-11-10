"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Info,
  Loader2,
  RefreshCw,
  Scale,
  Sparkles,
  Wheat,
} from "lucide-react";
import { formatKg, formatRupiah } from "@/lib/formatters";
import type {
  AiRationRecommendation,
  CattleProfile,
  FeedItem,
  OptimizationResult,
} from "@/types";

interface AiRecommendationCardProps {
  profile: CattleProfile;
  feeds: FeedItem[];
  daysToQurban: number;
  optimizationResult?: OptimizationResult;
}

export function AiRecommendationCard({
  profile,
  feeds,
  daysToQurban,
  optimizationResult,
}: AiRecommendationCardProps) {
  const [recommendation, setRecommendation] =
    useState<AiRationRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAiRecommendation = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/ai/ration-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cattle: {
            name: profile.name,
            breed: profile.breed,
            currentWeightKg: profile.currentWeightKg,
            targetWeightKg: profile.targetWeightKg,
            daysToQurban: daysToQurban,
            targetDateQurban: profile.targetDateQurban,
          },
          feeds: feeds.filter((f) => f.isActive),
          optimizationResult,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gagal memuat rekomendasi (HTTP ${res.status})`);
      }

      const data = (await res.json()) as AiRationRecommendation;
      setRecommendation(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat menghubungi API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/50 p-5 shadow-xs transition-all sm:p-6">
      {/* Header & Trigger Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xs">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">
                Rekomendasi Cerdas AI (Ration Nutrition Advisor)
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-black text-teal-800">
                <Sparkles className="h-3 w-3" />
                AI Ransum
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis kebutuhan nutrisi sapi qurban berbasis Gemini 3.8 Flash &amp; data pakan lokal terkini.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={fetchAiRecommendation}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:from-teal-800 hover:to-emerald-800 disabled:opacity-60 sm:text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menganalisis...</span>
            </>
          ) : recommendation ? (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Analisis Ulang AI</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Minta Rekomendasi AI</span>
            </>
          )}
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty State / Call to Action */}
      {!recommendation && !isLoading && (
        <div className="my-6 rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-6 text-center">
          <Cpu className="mx-auto h-10 w-10 text-teal-600/70 mb-2" />
          <h4 className="font-bold text-slate-800 text-sm sm:text-base">
            Dapatkan Rekomendasi Racikan Pakan dari AI
          </h4>
          <p className="mx-auto max-w-xl text-xs text-slate-600 mt-1">
            Klik tombol <strong>&ldquo;Minta Rekomendasi AI&rdquo;</strong> untuk
            menganalisis target bobot {profile.name} ({profile.breed}) menggunakan
            AI. Model akan memetakan takaran porsi pagi &amp; sore,
            biaya per hari, dan tips praktis di kandang.
          </p>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="my-6 space-y-4 animate-pulse">
          <div className="h-4 w-1/3 rounded bg-teal-200/60" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-xl bg-teal-100/50" />
            <div className="h-24 rounded-xl bg-teal-100/50" />
            <div className="h-24 rounded-xl bg-teal-100/50" />
          </div>
          <div className="h-40 rounded-xl bg-slate-100" />
        </div>
      )}

      {/* Recommendation Results Display */}
      {recommendation && !isLoading && (
        <div className="mt-5 space-y-5">
          {/* Status Source Badge & Disclaimer */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/80 p-3 ring-1 ring-teal-200/70 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Model Engine:</span>
              <span className="rounded-lg bg-teal-100 px-2.5 py-0.5 font-bold text-teal-900">
                {recommendation.modelUsed || "DeepSeek V4.1 Flash"}
              </span>
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-500">
                Sumber:{" "}
                {recommendation.source === "gemini"
                  ? "Google Gemini Live API"
                  : recommendation.source === "deploy_deepseek"
                  ? "Deploy.com Live API"
                  : "Sistem Pakar Nutrisi (Offline Backup)"}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Waktu: {new Date(recommendation.generatedAt).toLocaleTimeString("id-ID")} WIB
            </span>
          </div>

          {/* Warning Notices if any */}
          {recommendation.warnings && recommendation.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 space-y-1">
              {recommendation.warnings.map((w, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Info className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* 3 Core Analytical Cards */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {/* Target PBBH Evaluation */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Scale className="h-4 w-4 text-sky-700" />
                <span>Evaluasi PBBH</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {recommendation.analysis.pbbhEvaluation}
              </p>
            </div>

            {/* Feeding Strategy */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Wheat className="h-4 w-4 text-emerald-700" />
                <span>Strategi Pakan</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {recommendation.analysis.feedStrategy}
              </p>
            </div>

            {/* Adaptation Advice */}
            <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
              <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-2">
                <Clock className="h-4 w-4 text-teal-700" />
                <span>Adaptasi Lingkungan</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {recommendation.analysis.adaptationNote}
              </p>
            </div>
          </div>

          {/* Recommended Ingredient Mix Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Rincian Takaran Racikan Pakan Rekomendasi AI
                </h4>
                <p className="text-xs text-slate-500">
                  Dosis pemberian per ekor sapi dibagi 2 kali sehari: Pagi (07.00) &amp; Sore (16.00 WIB)
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Total Biaya Pakan Harian
                </span>
                <span className="text-base font-black text-emerald-700">
                  {formatRupiah(recommendation.totalDailyCostRp)} / hari
                </span>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-2.5 md:hidden">
              {recommendation.recommendedMix.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {item.name}
                    </span>
                    <span className="font-extrabold text-xs text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg">
                      {formatKg(item.amountKg, 2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                    <div>Pagi: <strong>{formatKg(item.morningKg, 2)}</strong></div>
                    <div>Sore: <strong>{formatKg(item.afternoonKg, 2)}</strong></div>
                    <div className="col-span-2 text-emerald-700 font-bold">
                      Biaya: {formatRupiah(item.costRp)}/hari
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 italic">
                    {item.nutritionalRole}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-3">Bahan Pakan</th>
                    <th className="pb-3 px-3 text-right">Total Harian (As-Fed)</th>
                    <th className="pb-3 px-3 text-right">Pagi (07:00)</th>
                    <th className="pb-3 px-3 text-right">Sore (16:00)</th>
                    <th className="pb-3 px-3 text-right">Estimasi Biaya</th>
                    <th className="pb-3 pl-3">Fungsi Nutrisi Ruminansia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recommendation.recommendedMix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 pr-3 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-800">
                        {formatKg(item.amountKg, 2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {formatKg(item.morningKg, 2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {formatKg(item.afternoonKg, 2)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                        {formatRupiah(item.costRp)}
                      </td>
                      <td className="py-3 pl-3 text-xs text-slate-600 max-w-xs">
                        {item.nutritionalRole}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-emerald-200 bg-emerald-50/60 font-extrabold text-emerald-950">
                    <td className="py-3 pl-2 pr-3">TOTAL REKOMENDASI AI</td>
                    <td className="py-3 px-3 text-right">
                      {formatKg(
                        recommendation.recommendedMix.reduce(
                          (acc, m) => acc + m.amountKg,
                          0
                        ),
                        2
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatKg(
                        recommendation.recommendedMix.reduce(
                          (acc, m) => acc + m.morningKg,
                          0
                        ),
                        2
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {formatKg(
                        recommendation.recommendedMix.reduce(
                          (acc, m) => acc + m.afternoonKg,
                          0
                        ),
                        2
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-900">
                      {formatRupiah(recommendation.totalDailyCostRp)}/hr
                    </td>
                    <td className="py-3 pl-3 text-xs text-emerald-800 font-bold">
                      Total Periode ({daysToQurban} Hari):{" "}
                      {formatRupiah(recommendation.totalPeriodCostRp)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Practical Management Advice Checklist */}
          {recommendation.managementAdvice &&
            recommendation.managementAdvice.length > 0 && (
              <div className="rounded-2xl border border-teal-200 bg-white p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="h-5 w-5 text-teal-700" />
                  <h4 className="text-sm font-extrabold text-slate-900">
                    Panduan Praktis Manajemen Kandang Peternak
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {recommendation.managementAdvice.map((tip, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}