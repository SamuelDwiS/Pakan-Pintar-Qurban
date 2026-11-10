"use client";

import React, { useMemo, useState } from "react";
import {
  Coins,
  Dna,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Warehouse,
  Wheat,
} from "lucide-react";
import { BreedCrudModal } from "@/components/master/BreedCrudModal";
import { MasterTabsNav } from "@/components/master/MasterTabsNav";
import { CustomFeedModal } from "@/components/ransum/CustomFeedModal";
import { FeedItemCard } from "@/components/ransum/FeedItemCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { useAppState } from "@/context/AppStateContext";
import { formatKg, formatRupiah } from "@/lib/formatters";
import type { BreedItem } from "@/types";

export default function MasterPakanPage() {
  const {
    feeds,
    updateFeedItem,
    addCustomFeed,
    deleteFeedItem,
    resetDefaultFeeds,
    breeds,
    addBreed,
    updateBreed,
    deleteBreed,
  } = useAppState();

  const [subTab, setSubTab] = useState<"pakan" | "ras">("pakan");
  const [feedModalOpen, setFeedModalOpen] = useState(false);

  const [breedModalOpen, setBreedModalOpen] = useState(false);
  const [breedMode, setBreedMode] = useState<"create" | "edit">("create");
  const [editingBreed, setEditingBreed] = useState<BreedItem | null>(null);

  // Analisis AI: Bahan pakan paling efisien sumber Protein (PK) & Energi (TDN)
  const efficiencyInsights = useMemo(() => {
    const active = feeds.filter((f) => f.isActive);
    if (active.length === 0) return null;

    const rankedByPk = [...active].sort((a, b) => {
      const costA =
        a.pricePerKg / ((a.bkPercent / 100) * (a.pkPercent / 100));
      const costB =
        b.pricePerKg / ((b.bkPercent / 100) * (b.pkPercent / 100));
      return costA - costB;
    });

    const rankedByTdn = [...active].sort((a, b) => {
      const costA =
        a.pricePerKg / ((a.bkPercent / 100) * (a.tdnPercent / 100));
      const costB =
        b.pricePerKg / ((b.bkPercent / 100) * (b.tdnPercent / 100));
      return costA - costB;
    });

    const bestPk = rankedByPk[0];
    const bestTdn = rankedByTdn[0];

    const bestPkCost = Math.round(
      bestPk.pricePerKg / ((bestPk.bkPercent / 100) * (bestPk.pkPercent / 100))
    );
    const bestTdnCost = Math.round(
      bestTdn.pricePerKg /
        ((bestTdn.bkPercent / 100) * (bestTdn.tdnPercent / 100))
    );

    return { bestPk, bestPkCost, bestTdn, bestTdnCost };
  }, [feeds]);

  // Perhitungan Akumulasi Total Stok Keseluruhan Pakan di Gudang
  const totalStockKg = useMemo(() => {
    return feeds
      .filter((f) => f.isActive)
      .reduce((acc, f) => acc + (f.maxLimitKg || 0), 0);
  }, [feeds]);

  const totalStockValueRp = useMemo(() => {
    return feeds
      .filter((f) => f.isActive)
      .reduce((acc, f) => acc + (f.maxLimitKg || 0) * f.pricePerKg, 0);
  }, [feeds]);

  const handleOpenAddBreed = () => {
    setBreedMode("create");
    setEditingBreed(null);
    setBreedModalOpen(true);
  };

  const handleOpenEditBreed = (breed: BreedItem) => {
    setBreedMode("edit");
    setEditingBreed(breed);
    setBreedModalOpen(true);
  };

  const handleSubmitBreed = (values: Omit<BreedItem, "id">) => {
    if (breedMode === "create") {
      addBreed(values);
    } else if (editingBreed) {
      updateBreed(editingBreed.id, values);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation antar menu Data Master */}
      <MasterTabsNav />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Data Master 2 &bull; Nutrisi Pakan Lokal &amp; Parameter Genetik Sapi
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Master Katalog Pakan &amp; Bangsa Sapi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Basis pengetahuan AI untuk menyusun ransum termurah (pengganti
            konsultan nutrisi) dan memvalidasi batas PBBH tiap ras sapi.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setSubTab("pakan")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              subTab === "pakan"
                ? "bg-emerald-700 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Wheat className="h-4 w-4" />
            <span>Katalog Pakan ({feeds.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab("ras")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              subTab === "ras"
                ? "bg-emerald-700 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Dna className="h-4 w-4" />
            <span>Bangsa / Ras Sapi ({breeds.length})</span>
          </button>
        </div>
      </div>

      {subTab === "pakan" ? (
        <>
          {/* AI Feed Efficiency Insight Banner */}
          {efficiencyInsights && (
            <div className="grid grid-cols-1 gap-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/60 p-4 sm:grid-cols-2 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    AI Insight: Sumber Protein Termurah Saat Ini
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                    {efficiencyInsights.bestPk.name} (
                    {formatRupiah(efficiencyInsights.bestPkCost)}/kg PK murni)
                  </p>
                  <p className="text-xs text-slate-500">
                    Dihitung otomatis dari harga pasar &amp; persentase Bahan Kering
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
                  <Wheat className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                    AI Insight: Sumber Energi (TDN) Termurah
                  </p>
                  <p className="mt-0.5 text-sm font-extrabold text-slate-900">
                    {efficiencyInsights.bestTdn.name} (
                    {formatRupiah(efficiencyInsights.bestTdnCost)}/kg TDN murni)
                  </p>
                  <p className="text-xs text-slate-500">
                    Diprioritaskan oleh Solver Linear Programming untuk menekan biaya
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Daftar Katalog Bahan Pakan */}
          <SectionCard
            title="Master Katalog & Total Stok Pakan Tersedia"
            subtitle="Kelola harga pasar lokal, kandungan nutrisi, dan total stok keseluruhan pakan (kg) yang tersedia di gudang/kandang"
            icon={<Wheat className="h-5 w-5" />}
            action={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetDefaultFeeds}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Harga Acuan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Pakan Lokal</span>
                </button>
              </div>
            }
          >
            {/* Ringkasan Akumulasi Total Stok Keseluruhan Pakan di Gudang */}
            <div className="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 sm:grid-cols-2 sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <Warehouse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Total Stok Keseluruhan Pakan di Gudang
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-900">
                    {formatKg(totalStockKg, 1)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Total akumulasi berat fisik pakan aktif yang siap diransumkan
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-2xs">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Estimasi Total Nilai Aset Pakan
                  </p>
                  <p className="text-base sm:text-lg font-black text-emerald-800">
                    {formatRupiah(totalStockValueRp)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Valuasi total inventaris pakan berdasarkan harga pasar
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {feeds.map((feed) => (
                <FeedItemCard
                  key={feed.id}
                  feed={feed}
                  showEfficiency
                  stockLabel="Total Stok Pakan (kg)"
                  stockTooltip="Total stok keseluruhan pakan yang tersedia di gudang/kandang dalam satuan berat kg"
                  stockUnit="kg"
                  maxStockLimit={100000}
                  onToggleActive={(id, isActive) =>
                    updateFeedItem(id, { isActive })
                  }
                  onChangePrice={(id, pricePerKg) =>
                    updateFeedItem(id, { pricePerKg })
                  }
                  onChangeMaxLimit={(id, maxLimitKg) =>
                    updateFeedItem(id, { maxLimitKg })
                  }
                  onDeleteCustom={deleteFeedItem}
                />
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard
          title="Master Standar Bangsa / Ras Sapi Potong"
          subtitle="Digunakan AI untuk memvalidasi apakah target kenaikan bobot kurban sesuai kapasitas genetik sapi"
          icon={<Dna className="h-5 w-5" />}
          action={
            <button
              type="button"
              onClick={handleOpenAddBreed}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Bangsa Sapi</span>
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {breeds.map((breed) => (
              <div
                key={breed.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800 ring-1 ring-inset ring-emerald-200">
                      Kode: {breed.code}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBreed(breed)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"
                        title="Edit Bangsa Sapi"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {breeds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Hapus bangsa sapi "${breed.name}" dari data master?`
                              )
                            ) {
                              deleteBreed(breed.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Hapus Bangsa Sapi"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-slate-900">
                    {breed.name}
                  </h3>
                  {breed.description && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {breed.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500">
                      PBBH Optimal
                    </span>
                    <p className="font-bold text-slate-900">
                      {breed.normalAdgKg.toFixed(2)} kg/hr
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500">
                      Batas Biologis AI
                    </span>
                    <p className="font-extrabold text-emerald-800">
                      &le; {breed.maxBiologicalAdgKg.toFixed(2)} kg/hr
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <CustomFeedModal
        isOpen={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        onAdd={addCustomFeed}
      />

      <BreedCrudModal
        isOpen={breedModalOpen}
        mode={breedMode}
        initialData={editingBreed}
        onClose={() => setBreedModalOpen(false)}
        onSubmitBreed={handleSubmitBreed}
      />
    </div>
  );
}

