"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Sparkles, Warehouse } from "lucide-react";
import { CattleCard } from "@/components/profil/CattleCard";
import { CattleCrudModal } from "@/components/profil/CattleCrudModal";
import { CattleDetailView } from "@/components/profil/CattleDetailView";
import { CattleSummaryStats } from "@/components/profil/CattleSummaryStats";
import { DeleteCattleModal } from "@/components/profil/DeleteCattleModal";
import { SectionCard } from "@/components/ui/SectionCard";
import {
  type CattleFormInput,
  useAppState,
} from "@/context/AppStateContext";
import { createDefaultHealthStatus } from "@/lib/constants";
import { calculateDaysToQurban } from "@/lib/fallback-engines";
import type { CattleProfile } from "@/types";

function ProfilPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailCattleId = searchParams.get("detail");
  const initialBarnQuery = searchParams.get("barn");

  const {
    barns,
    breeds,
    cattleList,
    activeCattleId,
    getNextDefaultCattleName,
    healthByCattleId,
    optimizationByCattleId,
    optimizationResult,
    selectActiveCattle,
    createCattle,
    updateCattleById,
    deleteCattleById,
    addWeightLog,
    removeWeightLog,
  } = useAppState();

  // State pencarian & filter pada menu daftar ternak
  const [searchQuery, setSearchQuery] = useState("");
  const [barnFilter, setBarnFilter] = useState<string>(
    initialBarnQuery || "ALL"
  );
  const [breedFilter, setBreedFilter] = useState<string>("ALL");

  useEffect(() => {
    if (initialBarnQuery) {
      setBarnFilter(initialBarnQuery);
    }
  }, [initialBarnQuery]);

  // State modal CRUD (Create / Edit / Delete)
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [crudMode, setCrudMode] = useState<"create" | "edit">("create");
  const [editingCattle, setEditingCattle] = useState<CattleProfile | null>(
    null
  );
  const [deletingCattle, setDeletingCattle] = useState<CattleProfile | null>(
    null
  );

  const barnNameById = useMemo(() => {
    const map: Record<string, string> = {};
    barns.forEach((b) => {
      map[b.id] = b.name;
    });
    return map;
  }, [barns]);

  // Sapi yang sedang dibuka detailnya (Level 2)
  const selectedDetailCattle = useMemo(
    () =>
      detailCattleId
        ? cattleList.find((item) => item.id === detailCattleId) || null
        : null,
    [cattleList, detailCattleId]
  );

  // Daftar sapi terfilter (Level 1)
  const filteredCattle = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cattleList.filter((item) => {
      const matchBarn = barnFilter === "ALL" || item.barnId === barnFilter;
      const matchBreed = breedFilter === "ALL" || item.breed === breedFilter;
      const barnName = (barnNameById[item.barnId] || "").toLowerCase();
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        barnName.includes(q) ||
        (item.stallNumber && item.stallNumber.toLowerCase().includes(q)) ||
        (item.earTag && item.earTag.toLowerCase().includes(q)) ||
        item.breed.toLowerCase().includes(q);
      return matchBarn && matchBreed && matchQuery;
    });
  }, [cattleList, searchQuery, barnFilter, breedFilter, barnNameById]);

  const handleOpenCreateModal = () => {
    setCrudMode("create");
    setEditingCattle(null);
    setCrudModalOpen(true);
  };

  const handleOpenEditModal = (cattle: CattleProfile) => {
    setCrudMode("edit");
    setEditingCattle(cattle);
    setCrudModalOpen(true);
  };

  const handleSubmitCrud = async (values: CattleFormInput) => {
    if (crudMode === "create") {
      await createCattle(values);
    } else if (editingCattle) {
      await updateCattleById(editingCattle.id, {
        name: values.name?.trim() || getNextDefaultCattleName(),
        barnId: values.barnId,
        stallNumber: values.stallNumber?.trim() || "",
        breed: values.breed,
        earTag: values.earTag?.trim() || "",
        initialWeightKg: Number(values.initialWeightKg),
        currentWeightKg: Number(values.currentWeightKg),
        targetWeightKg: Number(values.targetWeightKg),
        startDate: values.startDate,
        targetDateQurban: values.targetDateQurban,
      });
    }
  };

  const handleOpenDetail = async (cattle: CattleProfile) => {
    await selectActiveCattle(cattle.id);
    router.push(`/profil?detail=${encodeURIComponent(cattle.id)}`);
  };

  const handleBackToList = () => {
    router.push("/profil");
  };

  const handleConfirmDelete = (cattle: CattleProfile) => {
    deleteCattleById(cattle.id);
    if (detailCattleId === cattle.id) {
      router.push("/profil");
    }
  };

  // =========================================================================
  // LEVEL 2: DETAIL PROFIL & RIWAYAT BOBOT HEWAN TERNAK
  // =========================================================================
  if (selectedDetailCattle) {
    const detailDays = calculateDaysToQurban(
      selectedDetailCattle.targetDateQurban
    );
    const detailOpt =
      optimizationByCattleId[selectedDetailCattle.id] || optimizationResult;
    const detailHealth =
      healthByCattleId[selectedDetailCattle.id] ||
      createDefaultHealthStatus(selectedDetailCattle.id);

    return (
      <>
        <CattleDetailView
          cattle={selectedDetailCattle}
          barnName={barnNameById[selectedDetailCattle.barnId]}
          daysToQurban={detailDays}
          optimizationResult={detailOpt}
          healthStatus={detailHealth}
          onBackToList={handleBackToList}
          onSaveProfile={(patch) =>
            updateCattleById(selectedDetailCattle.id, patch)
          }
          onAddWeightLog={(entry) =>
            addWeightLog(entry, selectedDetailCattle.id)
          }
          onRemoveWeightLog={(logId) =>
            removeWeightLog(logId, selectedDetailCattle.id)
          }
          onRequestDelete={(cattle) => setDeletingCattle(cattle)}
        />

        <DeleteCattleModal
          cattle={deletingCattle}
          onClose={() => setDeletingCattle(null)}
          onConfirmDelete={handleConfirmDelete}
        />
      </>
    );
  }

  // =========================================================================
  // LEVEL 1: MENU CRUD DAFTAR HEWAN TERNAK (KANDANG)
  // =========================================================================
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header & Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Ternak &amp; Bobot
          </span>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Daftar Sapi Kurban
          </h1>
          <p className="text-xs text-slate-600">
            Kelola sapi kurban, penempatan kandang, dan riwayat timbangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/master-kandang"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Warehouse className="h-4 w-4 text-emerald-700" />
            <span>Master Kandang</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Tambah Sapi Baru</span>
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik Seluruh Kandang */}
      <CattleSummaryStats
        cattleList={cattleList}
        optimizationByCattleId={optimizationByCattleId}
        healthByCattleId={healthByCattleId}
      />

      {/* Daftar Kartu Sapi + Filter Kandang, Ras & Pencarian */}
      <SectionCard
        title="Daftar Sapi"
        subtitle="Pilih sapi untuk mencatat timbangan atau melihat grafik bobot"
        action={
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200">
            {filteredCattle.length} dari {cattleList.length} ekor
          </span>
        }
      >
        <div className="space-y-5">
          {/* Bar Pencarian + Filter Kandang + Filter Bangsa Sapi */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-5">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Sapi 1, patok, kandang, ciri fisik..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={barnFilter}
                onChange={(e) => setBarnFilter(e.target.value)}
                aria-label="Filter Lokasi Kandang"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">Semua Lokasi Kandang ({barns.length})</option>
                {barns.map((barn) => (
                  <option key={barn.id} value={barn.id}>
                    {barn.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={breedFilter}
                onChange={(e) => setBreedFilter(e.target.value)}
                aria-label="Filter Bangsa Sapi"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-emerald-600 focus:outline-none"
              >
                <option value="ALL">Semua Ras Sapi</option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Kartu Sapi atau Empty State */}
          {cattleList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900">
                Belum Ada Data Sapi di Kandang
              </h3>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500 sm:text-sm">
                Tambahkan sapi pertama Anda (otomatis dinamai Sapi 1 atau nama
                sendiri) untuk mulai menghitung ransum biaya minimum.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Sapi Pertama</span>
              </button>
            </div>
          ) : filteredCattle.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Tidak ditemukan sapi yang sesuai dengan filter pencarian saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCattle.map((cattle) => (
                <CattleCard
                  key={cattle.id}
                  cattle={cattle}
                  barnName={barnNameById[cattle.barnId]}
                  isActive={cattle.id === activeCattleId}
                  healthStatus={
                    healthByCattleId[cattle.id] ||
                    createDefaultHealthStatus(cattle.id)
                  }
                  optimization={optimizationByCattleId[cattle.id]}
                  onOpenDetail={handleOpenDetail}
                  onEdit={handleOpenEditModal}
                  onDelete={(target) => setDeletingCattle(target)}
                />
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Modal Tambah / Edit Sapi */}
      <CattleCrudModal
        isOpen={crudModalOpen}
        mode={crudMode}
        initialData={editingCattle}
        defaultBarnId={barnFilter !== "ALL" ? barnFilter : undefined}
        onClose={() => setCrudModalOpen(false)}
        onSubmitCattle={handleSubmitCrud}
      />

      {/* Modal Konfirmasi Hapus Sapi */}
      <DeleteCattleModal
        cattle={deletingCattle}
        onClose={() => setDeletingCattle(null)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
          Memuat daftar hewan ternak...
        </div>
      }
    >
      <ProfilPageContent />
    </Suspense>
  );
}
