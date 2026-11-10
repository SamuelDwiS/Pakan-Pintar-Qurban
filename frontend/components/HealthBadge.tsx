import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ListChecks,
  MessageCircle,
  Phone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { DEFAULT_VET_CONTACTS } from "@/lib/constants";
import { formatDateTimeId } from "@/lib/formatters";
import type { HealthStatus, RiskLevel, VetContactItem } from "@/types";

interface HealthBadgeProps {
  status: HealthStatus;
  variant?: "compact" | "detailed";
  cattleName?: string;
  barnName?: string;
  farmName?: string;
  vetContacts?: VetContactItem[];
}

const LEVEL_STYLES: Record<
  RiskLevel,
  {
    pill: string;
    dot: string;
    card: string;
    scoreBar: string;
    title: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  HIJAU: {
    pill: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
    card: "border-emerald-200 bg-emerald-50/60",
    scoreBar: "bg-emerald-500",
    title: "SEHAT & NORMAL",
    Icon: CheckCircle2,
  },
  KUNING: {
    pill: "bg-amber-50 text-amber-800 ring-amber-300",
    dot: "bg-amber-500",
    card: "border-amber-300 bg-amber-50/75",
    scoreBar: "bg-amber-500",
    title: "WASPADA (Perlu Perhatian)",
    Icon: AlertTriangle,
  },
  MERAH: {
    pill: "bg-rose-50 text-rose-800 ring-rose-300",
    dot: "bg-rose-600 animate-pulse",
    card: "border-rose-300 bg-rose-50/90",
    scoreBar: "bg-rose-600",
    title: "BAHAYA! INDIKASI PMK",
    Icon: ShieldAlert,
  },
};

export function HealthBadge({
  status,
  variant = "compact",
  cattleName,
  barnName,
  farmName,
  vetContacts,
}: HealthBadgeProps) {
  const cfg = LEVEL_STYLES[status.riskLevel] || LEVEL_STYLES.HIJAU;
  const Icon = cfg.Icon;

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${cfg.pill}`}
      >
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <span>
          {status.riskLevel} (Skor {status.totalScore})
        </span>
      </span>
    );
  }

  const meterPercent = Math.min(100, Math.round((status.totalScore / 80) * 100));
  const rawContacts =
    vetContacts && vetContacts.length > 0
      ? vetContacts
      : DEFAULT_VET_CONTACTS;
  const activeContacts = rawContacts.filter(
    (c) => c.name.trim().length > 0 && c.phone.trim().length > 0
  );

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${cfg.card}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-white p-2 shadow-2xs">
            <Icon
              className={`h-6 w-6 ${
                status.riskLevel === "MERAH"
                  ? "text-rose-600"
                  : status.riskLevel === "KUNING"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Kondisi Sapi Hari Ini
            </span>
            <h3 className="mt-0.5 text-base font-extrabold text-slate-900 sm:text-lg">
              {cfg.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Pemeriksaan: {formatDateTimeId(status.checkedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-3 py-1.5 text-right shadow-2xs sm:px-3.5 sm:py-2">
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Skor Risiko
          </p>
          <p className="text-lg font-black text-slate-900 sm:text-xl">
            {status.totalScore}{" "}
            <span className="text-xs font-medium text-slate-400">poin</span>
          </p>
        </div>
      </div>

      {/* Risk Threshold Meter */}
      <div className="mt-3.5 sm:mt-4">
        <div className="flex justify-between text-[10px] font-semibold text-slate-500 sm:text-[11px]">
          <span>0 (Sehat)</span>
          <span>20 (Waspada)</span>
          <span>40+ (Bahaya PMK)</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/90 ring-1 ring-slate-200/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.scoreBar}`}
            style={{ width: `${Math.max(4, meterPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-3.5 space-y-3 rounded-xl bg-white/90 p-3.5 ring-1 ring-slate-200/60 sm:mt-4 sm:p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Keterangan
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-800 sm:text-sm">
            {status.summary}
          </p>
        </div>

        {status.triggeredIndicators &&
          status.triggeredIndicators.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Tanda yang Terlihat
              </p>
              <ul className="mt-1 space-y-1">
                {status.triggeredIndicators.map((ind) => (
                  <li
                    key={ind}
                    className="flex items-center gap-2 text-xs font-medium text-slate-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {status.catatanTambahan && (
          <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
            <span className="font-bold text-slate-600">Catatan Lain Peternak:</span>{" "}
            &ldquo;{status.catatanTambahan}&rdquo;
          </div>
        )}

        {/* Rekomendasi Tindakan Operasional yang Harus Dilakukan */}
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <ListChecks
              className={`h-4.5 w-4.5 shrink-0 ${
                status.riskLevel === "MERAH"
                  ? "text-rose-600"
                  : status.riskLevel === "KUNING"
                  ? "text-amber-600"
                  : "text-emerald-700"
              }`}
            />
            <p className="text-xs sm:text-sm font-extrabold text-slate-900">
              Rekomendasi Tindakan yang Harus Dilakukan:
            </p>
          </div>

          <p className="mt-1 text-xs font-semibold text-slate-600">
            {status.recommendedAction}
          </p>

          {status.actionSteps && status.actionSteps.length > 0 ? (
            <div className="mt-2.5 space-y-2">
              {status.actionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 rounded-xl p-2.5 text-xs sm:text-sm ${
                    status.riskLevel === "MERAH"
                      ? "border border-rose-200 bg-rose-50/80 text-rose-950"
                      : status.riskLevel === "KUNING"
                      ? "border border-amber-200 bg-amber-50/80 text-amber-950"
                      : "border border-emerald-200 bg-emerald-50/80 text-emerald-950"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                      status.riskLevel === "MERAH"
                        ? "bg-rose-600 text-white"
                        : status.riskLevel === "KUNING"
                        ? "bg-amber-600 text-white"
                        : "bg-emerald-700 text-white"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-semibold leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-xl bg-slate-50 p-2.5 text-xs font-medium text-slate-700">
              {status.recommendedAction}
            </div>
          )}
        </div>

        {/* Rekomendasi Intervensi Ransum AI (Closed-Loop Feeding) */}
        {status.dietaryIntervention && (
          <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white p-3.5 sm:p-4 text-xs shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-700 text-white text-[11px] font-black shadow-2xs">
                  AI
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <span>💡 {status.dietaryIntervention.headline}</span>
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    {status.dietaryIntervention.clinicalReason}
                  </p>
                </div>
              </div>

              <Link
                href="/ransum"
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-emerald-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sesuaikan di Ransum</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Rekomendasi Porsi Bahan */}
            <div className="mt-2.5 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tindakan Penyesuaian Pakan Hari Ini:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {status.dietaryIntervention.feedAdjustments.map((adj, i) => {
                  const isPositive =
                    adj.adjustmentType === "TAMBAH" ||
                    adj.adjustmentType === "UTAMAKAN";
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white/95 p-2.5 shadow-2xs"
                    >
                      <span
                        className={`mt-0.5 inline-block shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase ${
                          isPositive
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {adj.adjustmentType === "TAMBAH" && adj.suggestedDeltaKg
                          ? `+${adj.suggestedDeltaKg} kg`
                          : adj.adjustmentType === "KURANGI" && adj.suggestedDeltaKg
                          ? `${adj.suggestedDeltaKg} kg`
                          : adj.adjustmentType.replace("_", " ")}
                      </span>
                      <div className="min-w-0">
                        <strong className="text-xs text-slate-900 font-bold block truncate">
                          {adj.feedName}
                        </strong>
                        <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                          {adj.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips Praktis Peternak */}
            {status.dietaryIntervention.practicalTips.length > 0 && (
              <div className="mt-2.5 border-t border-emerald-100/90 pt-2 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Tips Operasional Kandang:</span>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {status.dietaryIntervention.practicalTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Edukasi Penanganan Mandiri saat Status Waspada (Kuning) */}
        {status.riskLevel === "KUNING" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Tahap Penanganan Mandiri Peternak (Observasi 1×24 Jam)</span>
            </p>
            <p className="mt-1 leading-relaxed text-amber-900/90">
              Sapi terindikasi mengalami penurunan kondisi ringan. Lakukan langkah mandiri bernomor di atas terlebih dahulu. <strong>Belum perlu memanggil mantri/dokter hewan</strong> agar tidak membebani biaya suntik sebelum terbukti ada infeksi klinis. Tombol darurat WhatsApp akan otomatis aktif jika terdeteksi gejala bahaya (Merah).
            </p>
          </div>
        )}

        {/* Lapor Darurat WhatsApp ke Mantri (HANYA MUNCUL DI STATUS MERAH) */}
        {status.riskLevel === "MERAH" && activeContacts.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Kirim Laporan WA Darurat ke Mantri ({activeContacts.length} Kontak):
                </p>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Respon Cepat 1-Klik
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              Pesan terisi otomatis. Jika mantri utama berhalangan atau slow respon, Anda bisa langsung hubungi mantri lainnya:
            </p>

            <div
              className={`mt-2.5 grid grid-cols-1 gap-2 ${
                activeContacts.length === 1
                  ? "max-w-xs"
                  : activeContacts.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
              }`}
            >
              {activeContacts.map((contact) => {
                const cleanPhone =
                  contact.phone.replace(/[^0-9]/g, "") || "6281200000001";
                const waText = [
                  `*LAPORAN DARURAT KESEHATAN TERNAK — PAKAN PINTAR QURBAN*`,
                  `Yth. ${contact.name}`,
                  `Peternakan : ${farmName || "Peternakan Mandiri"}`,
                  `Identitas Sapi : ${cattleName || status.cattleId}`,
                  barnName ? `Lokasi Kandang : ${barnName}` : null,
                  `Status AI : *${status.riskLevel} (Skor ${status.totalScore})*`,
                  `Tanda Fisik : ${
                    status.triggeredIndicators &&
                    status.triggeredIndicators.length > 0
                      ? status.triggeredIndicators.join(", ")
                      : status.summary
                  }`,
                  status.catatanTambahan?.trim()
                    ? `Catatan Tambahan Peternak : "${status.catatanTambahan.trim()}"`
                    : null,
                  `Mohon arahan / bantuan tindakan medis darurat. Terima kasih.`,
                ]
                  .filter(Boolean)
                  .join("\n");

                const href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  waText
                )}`;

                return (
                  <a
                    key={contact.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col justify-between rounded-xl p-2.5 transition-all border shadow-2xs hover:shadow-sm ${
                      contact.isPrimary
                        ? "bg-rose-600 text-white border-rose-700 hover:bg-rose-700"
                        : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-xs truncate">
                            {contact.name}
                          </span>
                        </div>
                        {contact.roleNote && (
                          <p
                            className={`text-[10px] truncate mt-0.5 ${
                              contact.isPrimary
                                ? "text-white/80"
                                : "text-slate-500"
                            }`}
                          >
                            {contact.roleNote}
                          </p>
                        )}
                      </div>
                      {contact.isPrimary && (
                        <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shrink-0">
                          Utama
                        </span>
                      )}
                    </div>

                    <div
                      className={`mt-2 flex items-center justify-between text-[11px] font-bold pt-1.5 border-t ${
                        contact.isPrimary
                          ? "border-white/20 text-white"
                          : "border-slate-100 text-rose-700"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{contact.phone}</span>
                      </span>
                      <span>Kirim WA &rarr;</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
