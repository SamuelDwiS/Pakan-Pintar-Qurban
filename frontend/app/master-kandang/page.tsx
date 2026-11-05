"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Check,
  Coins,
  Pencil,
  Phone,
  Plus,
  Save,
  Trash2,
  Users,
  Warehouse,
} from "lucide-react";
import { BarnCrudModal } from "@/components/master/BarnCrudModal";
import { MasterTabsNav } from "@/components/master/MasterTabsNav";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatMetricCard } from "@/components/ui/StatMetricCard";
import { useAppState } from "@/context/AppStateContext";
import { formatRupiah } from "@/lib/formatters";
import type { BarnItem } from "@/types";

export default function MasterKandangPage() {
  const {
    barns,
    addBarn,
    updateBarn,
    deleteBarn,
    cattleList,
    optimizationByCattleId,
    farmSettings,
    updateFarmSettings,
  } = useAppState();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBarn, setEditingBarn] = useState<BarnItem | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form Pengaturan Musim Kurban & Kontak WA Darurat
  const [qurbanDate, setQurbanDate] = useState(
    farmSettings.defaultTargetDateQurban
  );
  const [clinicName, setClinicName] = useState(farmSettings.vetClinicName);
  const [waNumber, setWaNumber] = useState(farmSettings.vetWhatsappNumber);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const totalCapacity = barns.reduce((sum, b) => sum + b.capacity, 0);
  const totalOccupied = cattleList.length;

  const handleOpenCreate = () => {
    setErrorBanner(null);
    setModalMode("create");
    setEditingBarn(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (barn: BarnItem) => {
    setErrorBanner(null);
    setModalMode("edit");
    setEditingBarn(barn);
    setModalOpen(true);
  };

  const handleSubmitBarn = (values: Omit<BarnItem, "id">) => {
    if (modalMode === "create") {
      addBarn(values);
    } else if (editingBarn) {
      updateBarn(editingBarn.id, values);
    }
  };

  const handleDeleteBarn = (barn: BarnItem) => {
    setErrorBanner(null);
    if (!window.confirm(`Hapus data "${barn.name}" dari Master Kandang?`)) {
      return;
    }
    const res = deleteBarn(barn.id);
    if (!res.ok && res.error) {
      setErrorBanner(res.error);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmSettings({
      defaultTargetDateQurban: qurbanDate,
      vetClinicName: clinicName.trim() || "Puskeswan / Medik Veteriner Terdekat",
      vetWhatsappNumber: waNumber.replace(/[^0-9]/g, "") || "6281390375757",
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation antar menu Data Master */}
      <MasterTabsNav />

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Data Master 1 &bull; Infrastruktur Kandang &amp; Parameter Musim
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Master Kandang &amp; Pengaturan Kurban
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Atur blok kandang untuk pengelompokan sapi serta nomor WhatsApp
            rujukan darurat Puskeswan tanpa perlu akun pihak ketiga.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-800 sm:w-auto"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Tambah Blok Kandang</span>
        </button>
      </div>

      {errorBanner && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 sm:text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Ringkasan Kapasitas Kandang */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <StatMetricCard
          label="Total Blok Kandang"
          value={`${barns.length} Kandang`}
          subtext="Individu / Tambat & Koloni"
          icon={<Warehouse className="h-5 w-5" />}
          tone="emerald"
        />
        <StatMetricCard
          label="Keterisian Populasi"
          value={`${totalOccupied} / ${totalCapacity} Ekor`}
          subtext={`Sisa ruang tersedia: ${Math.max(
            0,
            totalCapacity - totalOccupied
          )} ekor`}
          icon={<Users className="h-5 w-5" />}
          tone="sky"
        />
        <StatMetricCard
          label="Target Idul Adha Acuan"
          value={farmSettings.defaultTargetDateQurban}
          subtext="Otomatis terisi saat tambah sapi baru"
          icon={<CalendarClock className="h-5 w-5" />}
          tone="slate"
        />
      </div>

      {/* Daftar Kartu Kandang */}
      <SectionCard
        title="Daftar Blok Kandang Aktif"
        subtitle="Setiap sapi yang didaftarkan ditempatkan ke salah satu kandang di bawah ini untuk memudahkan pemberian pakan harian"
        icon={<Warehouse className="h-5 w-5" />}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barns.map((barn) => {
            const occupants = cattleList.filter((c) => c.barnId === barn.id);
            const occupancyPct = Math.min(
              100,
              Math.round((occupants.length / Math.max(1, barn.capacity)) * 100)
            );
            const dailyBarnCost = occupants.reduce(
              (sum, c) =>
                sum + (optimizationByCattleId[c.id]?.totalCostPerDayRp || 0),
              0
            );

            return (
              <div
                key={barn.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-emerald-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        barn.type === "Koloni"
                          ? "bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-200"
                          : "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
                      }`}
                    >
                      {barn.type}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(barn)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-700"
                        title="Edit Kandang"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBarn(barn)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Hapus Kandang"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-2.5 text-base font-extrabold text-slate-900">
                    {barn.name}
                  </h3>
                  {barn.locationNote && (
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {barn.locationNote}
                    </p>
                  )}

                  {/* Bar Keterisian */}
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Keterisian Sapi:</span>
                      <span className="font-bold text-slate-900">
                        {occupants.length} / {barn.capacity} ekor
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct >= 90 ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate">
                        {occupants.length > 0
                          ? occupants.map((o) => o.name).join(", ")
                          : "Belum ada sapi"}
                      </span>
                    </div>

                    {dailyBarnCost > 0 && (
                      <div className="mt-2 flex items-center gap-1 border-t border-slate-200/70 pt-2 text-[11px] font-bold text-emerald-800">
                        <Coins className="h-3.5 w-3.5" />
                        <span>
                          Total Ransum Kandang: {formatRupiah(dailyBarnCost)}/hr
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/profil?barn=${encodeURIComponent(barn.id)}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    <span>Lihat Ternak</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Pengaturan Musim Kurban & Kontak Darurat WA */}
      <SectionCard
        title="Pengaturan Musim Kurban & Kontak WhatsApp Darurat"
        subtitle="Digunakan untuk target tanggal default sapi baru serta pembuatan pesan laporan darurat otomatis jika terdeteksi gejala PMK (Merah)"
        icon={<Phone className="h-5 w-5" />}
      >
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Tanggal Idul Adha Default
              </label>
              <input
                type="date"
                required
                value={qurbanDate}
                onChange={(e) => setQurbanDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nama Instansi / Mantri / Puskeswan Rujukan
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="Contoh: Puskeswan Kec. Mojosongo"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Nomor WhatsApp Darurat (Format 628xxx)
              </label>
              <input
                type="text"
                required
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="6281390375757"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            {settingsSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4" />
                Pengaturan musim kurban &amp; nomor WA berhasil disimpan!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Tanpa perlu login dokter hewan — laporan gejala kritis dikirim
                1-klik via WhatsApp peternak.
              </span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 sm:text-sm"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </SectionCard>

      <BarnCrudModal
        isOpen={modalOpen}
        mode={modalMode}
        initialData={editingBarn}
        onClose={() => setModalOpen(false)}
        onSubmitBarn={handleSubmitBarn}
      />
    </div>
  );
}

