"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  Coins,
  Database,
  Scale,
  Sparkles,
  UserCheck,
  Warehouse,
  Wheat,
} from "lucide-react";
import { FeedItemCard } from "@/components/ransum/FeedItemCard";
import { RationTable } from "@/components/RationTable";
import { CattleSelectorBar } from "@/components/ui/CattleSelectorBar";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatMetricCard } from "@/components/ui/StatMetricCard";
import { useAppState } from "@/context/AppStateContext";
import { formatKg, formatRupiah } from "@/lib/formatters";

export default function RansumPage() {
  const {
    barns,
    cattleList,
    profile,
    feeds,
    daysToQurban,
    optimizationResult,
    optimizationByCattleId,
    isOptimizing,
    updateFeedItem,
    runOptimization,
  } = useAppState();

  const [mode, setMode] = useState<"individual" | "barn">("individual");
  const [selectedBarnId, setSelectedBarnId] = useState<string>(
    profile.barnId || barns[0]?.id || "kandang-a"
  );
  const [showQuickFeeds, setShowQuickFeeds] = useState(false);

  const activeCount = feeds.filter((f) => f.isActive).length;

  // Data agregasi AI untuk Mode 1 Kandang Sekaligus
  const barnRecap = useMemo(() => {
    const targetBarn =
      barns.find((b) => b.id === selectedBarnId) || barns[0] || null;
    const cowsInBarn = cattleList.filter((c) => c.barnId === targetBarn?.id);

    const ingredientMap = new Map<
      string,
      {
        feedId: string;
        feedName: string;
        totalAsFedKg: number;
        totalBkKg: number;
        totalCostRp: number;
      }
    >();

    let totalCostPerDayRp = 0;
    let totalAsFedDayKg = 0;
    let totalBkDayKg = 0;

    cowsInBarn.forEach((cow) => {
      const opt = optimizationByCattleId[cow.id];
      if (!opt) return;
      totalCostPerDayRp += opt.totalCostPerDayRp;
      totalBkDayKg += opt.totalBkProvidedKg;

      opt.rationComposition.forEach((item) => {
        totalAsFedDayKg += item.amountAsFedKg;
        const existing = ingredientMap.get(item.feedId);
        if (existing) {
          existing.totalAsFedKg += item.amountAsFedKg;
          existing.totalBkKg += item.amountBkKg;
          existing.totalCostRp += item.costRp;
        } else {
          ingredientMap.set(item.feedId, {
            feedId: item.feedId,
            feedName: item.feedName,
            totalAsFedKg: item.amountAsFedKg,
            totalBkKg: item.amountBkKg,
            totalCostRp: item.costRp,
          });
        }
      });
    });

    const aggregatedFeeds = Array.from(ingredientMap.values()).sort(
      (a, b) => b.totalAsFedKg - a.totalAsFedKg
    );

    return {
      targetBarn,
      cowsInBarn,
      aggregatedFeeds,
      totalCostPerDayRp,
      totalAsFedDayKg,
      totalBkDayKg,
    };
  }, [barns, cattleList, optimizationByCattleId, selectedBarnId]);

  return (
    <div className="space-y-6">
      {/* Header & Main Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Rekomendasi Pakan Harian
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Komposisi pakan lokal termurah yang memenuhi kebutuhan gizi sapi Anda hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/master-pakan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Database className="h-4 w-4 text-emerald-700" />
            <span>Master Pakan ({activeCount} Aktif)</span>
          </Link>

          <button
            type="button"
            disabled={isOptimizing}
            onClick={() => runOptimization()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-800 disabled:opacity-60 sm:text-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {isOptimizing ? "Menghitung Solver..." : "Hitung Ulang AI"}
            </span>
          </button>
        </div>
      </div>

      {/* Mode Switcher: Per Ekor Sapi vs Rekap 1 Kandang */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xs">
        <div className="grid w-full grid-cols-2 gap-1.5 sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("individual")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              mode === "individual"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Takaran Per Ekor Sapi</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("barn")}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
              mode === "barn"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Rekap Adukan 1 Kandang</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowQuickFeeds((prev) => !prev)}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 sm:w-auto"
        >
          <Wheat className="h-3.5 w-3.5 text-emerald-700" />
          <span>
            {showQuickFeeds
              ? "Sembunyikan Cek Stok & Harga Cepat"
              : "Cek Stok & Ubah Harga Pakan Cepat"}
          </span>
          {showQuickFeeds ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Collapsible Quick Stock & Price Adjuster */}
      {showQuickFeeds && (
        <SectionCard
            title="Penyesuaian Stok & Harga Pakan Hari Ini"
            subtitle="Centang bahan yang ada di kandang, lalu klik Hitung Ulang"
            icon={<Wheat className="h-5 w-5" />}
          action={
            <button
              type="button"
              disabled={isOptimizing}
              onClick={() => runOptimization()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Terapkan ke Ransum</span>
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {feeds.map((feed) => (
              <FeedItemCard
                key={feed.id}
                feed={feed}
                onToggleActive={(id, isActive) =>
                  updateFeedItem(id, { isActive })
                }
                onChangePrice={(id, pricePerKg) =>
                  updateFeedItem(id, { pricePerKg })
                }
                onChangeMaxLimit={(id, maxLimitKg) =>
                  updateFeedItem(id, { maxLimitKg })
                }
              />
            ))}
          </div>
        </SectionCard>
      )}

      {/* =================================================================== */}
      {/* MODE 1: TAKARAN PER EKOR SAPI                                       */}
      {/* =================================================================== */}
      {mode === "individual" ? (
        <>
          <CattleSelectorBar />

          {/* Ringkasan Parameter Ternak Saat Ini */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-xs sm:px-5 sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-700">
              <span>
                Sapi:{" "}
                <strong className="text-slate-900">{profile.name}</strong>
              </span>
              <span>
                Bobot Saat Ini:{" "}
                <strong className="text-slate-900">
                  {formatKg(profile.currentWeightKg, 1)}
                </strong>
              </span>
              <span>
                Target PBBH:{" "}
                <strong className="text-emerald-800">
                  {optimizationResult.adgRequiredKg.toFixed(2)} kg/hari
                </strong>
              </span>
            </div>

            {optimizationResult.requirements && (
              <div className="text-xs font-semibold text-emerald-800">
                Kebutuhan Nutrisi: BK {optimizationResult.requirements.bkReqKg}{" "}
                kg &bull; PK {optimizationResult.requirements.pkReqKg} kg &bull;
                TDN {optimizationResult.requirements.tdnReqKg} kg
              </div>
            )}
          </div>

          <SectionCard
            title={`Takaran Pakan Harian — ${profile.name}`}
            subtitle="Timbang dan berikan ke palung pakan setiap pagi & sore"
            icon={<Calculator className="h-5 w-5" />}
          >
            <RationTable
              result={optimizationResult}
              daysToQurban={daysToQurban}
            />
          </SectionCard>
        </>
      ) : (
        /* =================================================================== */
        /* MODE 2: REKAP ADUKAN 1 KANDANG SEKALIGUS                            */
        /* =================================================================== */
        <div className="space-y-6">
          {/* Pilihan Kandang */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-600 sm:text-sm">
                Pilih Blok Kandang:
              </span>
              <select
                value={selectedBarnId}
                onChange={(e) => setSelectedBarnId(e.target.value)}
                className="rounded-xl border border-emerald-300 bg-emerald-50/70 px-3.5 py-2 text-xs font-extrabold text-emerald-950 focus:border-emerald-600 focus:outline-none sm:text-sm"
              >
                {barns.map((b) => {
                  const count = cattleList.filter((c) => c.barnId === b.id).length;
                  return (
                    <option key={b.id} value={b.id}>
                      {b.name} ({count} ekor sapi)
                    </option>
                  );
                })}
              </select>
            </div>

            {barnRecap.targetBarn && (
              <span className="text-xs font-semibold text-slate-500">
                Tipe Kandang:{" "}
                <strong className="text-slate-800">
                  {barnRecap.targetBarn.type}
                </strong>
              </span>
            )}
          </div>

          {barnRecap.cowsInBarn.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
              Belum ada sapi yang ditempatkan di{" "}
              <strong>{barnRecap.targetBarn?.name}</strong>. Silakan tempatkan
              sapi melalui menu{" "}
              <Link
                href="/profil"
                className="font-bold text-emerald-700 underline"
              >
                Ternak &amp; Bobot
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <StatMetricCard
                  label="Jumlah Sapi di Kandang"
                  value={`${barnRecap.cowsInBarn.length} Ekor`}
                  subtext={barnRecap.cowsInBarn.map((c) => c.name).join(", ")}
                  icon={<Warehouse className="h-5 w-5" />}
                  tone="emerald"
                />
                <StatMetricCard
                  label="Total Pakan Segar Harian"
                  value={formatKg(barnRecap.totalAsFedDayKg, 1)}
                  subtext={`Total Bahan Kering: ${formatKg(
                    barnRecap.totalBkDayKg,
                    1
                  )}`}
                  icon={<Scale className="h-5 w-5" />}
                  tone="sky"
                />
                <StatMetricCard
                  label="Total Biaya Pakan Kandang"
                  value={`${formatRupiah(barnRecap.totalCostPerDayRp)}/hr`}
                  subtext="Akumulasi biaya pakan termurah 1 blok"
                  icon={<Coins className="h-5 w-5" />}
                  tone="amber"
                />
              </div>

              <SectionCard
                title={`Total Kebutuhan Bahan Pakan Harian — ${barnRecap.targetBarn?.name}`}
                subtitle="Siapkan total takaran berikut di gudang pakan untuk seluruh sapi di kandang ini hari ini"
                icon={<Wheat className="h-5 w-5" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="pb-3 pr-4">Bahan Pakan Lokal</th>
                        <th className="pb-3 px-4 text-right">
                          Total Timbang Segar (As-Fed)
                        </th>
                        <th className="pb-3 px-4 text-right">
                          Total Bahan Kering (BK)
                        </th>
                        <th className="pb-3 pl-4 text-right">
                          Subtotal Biaya / Hari
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {barnRecap.aggregatedFeeds.map((item) => (
                        <tr key={item.feedId} className="hover:bg-slate-50/70">
                          <td className="py-3 pr-4 font-bold text-slate-900">
                            {item.feedName}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-emerald-800">
                            {formatKg(item.totalAsFedKg, 2)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600">
                            {formatKg(item.totalBkKg, 2)}
                          </td>
                          <td className="py-3 pl-4 text-right font-bold text-slate-900">
                            {formatRupiah(item.totalCostRp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-emerald-200 bg-emerald-50/60 font-extrabold text-emerald-950">
                        <td className="py-3 pl-2 pr-4">
                          TOTAL 1 KANDANG ({barnRecap.cowsInBarn.length} EKOR)
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatKg(barnRecap.totalAsFedDayKg, 2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatKg(barnRecap.totalBkDayKg, 2)}
                        </td>
                        <td className="py-3 pl-4 pr-2 text-right">
                          {formatRupiah(barnRecap.totalCostPerDayRp)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      )}
    </div>
  );
}
