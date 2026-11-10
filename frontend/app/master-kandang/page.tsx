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
import { DEFAULT_VET_CONTACTS } from "@/lib/constants";
import { formatRupiah } from "@/lib/formatters";
import type { BarnItem, VetContactItem } from "@/types";

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
  const [contacts, setContacts] = useState<VetContactItem[]>(
    farmSettings.vetContacts && farmSettings.vetContacts.length > 0
      ? farmSettings.vetContacts
      : DEFAULT_VET_CONTACTS
  );
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

  const handleContactChange = (
    index: number,
    field: keyof VetContactItem,
    value: string
  ) => {
    setContacts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddContact = () => {
    if (contacts.length >= 3) return;
    const newIdx = contacts.length + 1;
    const newContact: VetContactItem = {
      id: `vet-${Date.now()}`,
      name: "",
      phone: "",
      roleNote:
        newIdx === 2
          ? "drh. Puskeswan / Medik Veteriner"
          : "Mantri Inseminator / Cadangan",
      isPrimary: false,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const handleRemoveContact = (index: number) => {
    if (contacts.length <= 1) return; // Minimal harus ada 1 kontak mantri utama
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (contacts.length === 0) return;
    const primary = contacts.find((c) => c.isPrimary) || contacts[0];
    updateFarmSettings({
      defaultTargetDateQurban: qurbanDate,
      vetClinicName: primary?.name.trim() || "Mantri Hewan Terdekat",
      vetWhatsappNumber: (primary?.phone || "6281200000001").replace(/[^0-9]/g, ""),
      vetContacts: contacts,
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
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Target Idul Adha */}
          <div className="max-w-md">
            <label className="block text-xs font-semibold text-slate-700">
              Target Tanggal Idul Adha Default
            </label>
            <input
              type="date"
              required
              value={qurbanDate}
              onChange={(e) => setQurbanDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Menjadi acuan otomatis hitungan hari mundur (countdown) saat menambah sapi baru.
            </p>
          </div>

          {/* Daftar Kontak Mantri / Dokter Hewan Langganan (Fleksibel 1-3 Kontak) */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Daftar Kontak Mantri / Dokter Hewan ({contacts.length} Kontak)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dihubungi via WhatsApp saat kondisi darurat kritis (Merah). Fleksibel jika hanya punya 1 mantri langganan.
                </p>
              </div>

              {contacts.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="inline-flex items-center gap-1 rounded-xl border border-dashed border-emerald-600 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Tambah Mantri ({contacts.length}/3)</span>
                </button>
              )}
            </div>

            <div
              className={`grid grid-cols-1 gap-3 ${
                contacts.length === 1
                  ? "max-w-md"
                  : contacts.length === 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              }`}
            >
              {contacts.map((contact, idx) => {
                const isFirst = idx === 0;
                const priorityBadge = isFirst
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : idx === 1
                  ? "bg-sky-100 text-sky-800 border-sky-300"
                  : "bg-slate-100 text-slate-700 border-slate-300";

                return (
                  <div
                    key={contact.id || idx}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-all hover:bg-slate-50"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${priorityBadge}`}
                        >
                          {idx === 0
                            ? "Kontak 1 • Mantri Utama"
                            : idx === 1
                            ? "Kontak 2 • Puskeswan / Cadangan"
                            : "Kontak 3 • Cadangan"}
                        </span>

                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => handleRemoveContact(idx)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus kontak ini"
                            aria-label={`Hapus kontak ${idx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Nama Mantri / Instansi
                        </label>
                        <input
                          type="text"
                          required
                          value={contact.name}
                          onChange={(e) =>
                            handleContactChange(idx, "name", e.target.value)
                          }
                          placeholder={
                            idx === 0 ? "Pak Mantri Budi" : "drh. Hendra"
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Nomor WA (Format 628xxx)
                        </label>
                        <input
                          type="text"
                          required
                          value={contact.phone}
                          onChange={(e) =>
                            handleContactChange(idx, "phone", e.target.value)
                          }
                          placeholder="628123456789"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">
                          Catatan / Peran
                        </label>
                        <input
                          type="text"
                          value={contact.roleNote || ""}
                          onChange={(e) =>
                            handleContactChange(idx, "roleNote", e.target.value)
                          }
                          placeholder="Contoh: Mantri Langganan Desa"
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            {settingsSaved ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="h-4 w-4" />
                Pengaturan musim kurban &amp; kontak mantri berhasil disimpan!
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Tombol WhatsApp darurat hanya akan muncul saat status Bahaya (Merah). Status Waspada (Kuning) fokus pada penanganan mandiri peternak.
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

