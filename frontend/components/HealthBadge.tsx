import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  ShieldAlert,
} from "lucide-react";
import { formatDateTimeId } from "@/lib/formatters";
import type { HealthStatus, RiskLevel } from "@/types";

interface HealthBadgeProps {
  status: HealthStatus;
  variant?: "compact" | "detailed";
  cattleName?: string;
  barnName?: string;
  farmName?: string;
  vetClinicName?: string;
  vetWhatsappNumber?: string;
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
    title: "LEVEL HIJAU — SEHAT / NORMAL",
    Icon: CheckCircle2,
  },
  KUNING: {
    pill: "bg-amber-50 text-amber-800 ring-amber-300",
    dot: "bg-amber-500",
    card: "border-amber-300 bg-amber-50/75",
    scoreBar: "bg-amber-500",
    title: "LEVEL KUNING — WASPADA",
    Icon: AlertTriangle,
  },
  MERAH: {
    pill: "bg-rose-50 text-rose-800 ring-rose-300",
    dot: "bg-rose-600 animate-pulse",
    card: "border-rose-300 bg-rose-50/90",
    scoreBar: "bg-rose-600",
    title: "LEVEL MERAH — BAHAYA / INDIKASI PMK",
    Icon: ShieldAlert,
  },
};

export function HealthBadge({
  status,
  variant = "compact",
  cattleName,
  barnName,
  farmName,
  vetClinicName = "Puskeswan / Medik Veteriner",
  vetWhatsappNumber = "6281390375757",
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

  // Buat tautan laporan darurat WhatsApp 1-klik tanpa perlu login dokter hewan
  const cleanWa = vetWhatsappNumber.replace(/[^0-9]/g, "") || "6281390375757";
  const symptomsText =
    status.triggeredIndicators && status.triggeredIndicators.length > 0
      ? status.triggeredIndicators.join(", ")
      : status.summary;
  const waMessage = [
    `*LAPORAN SKRINING DINI PMK — PAKAN PINTAR QURBAN*`,
    `Peternakan: ${farmName || "Peternak Mandiri"}`,
    `Identitas Sapi: ${cattleName || status.cattleId}`,
    barnName ? `Lokasi Kandang: ${barnName}` : null,
    `Status AI KIAT VETINDO: *${status.riskLevel} (Skor ${status.totalScore})*`,
    `Gejala Terdeteksi: ${symptomsText}`,
    `Mohon arahan pemeriksaan / tindakan lebih lanjut.`,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappHref = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    waMessage
  )}`;

  return (
    <div className={`rounded-2xl border p-5 ${cfg.card}`}>
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
              AI Expert System &bull; Standar KIAT VETINDO PMK Kementan RI
            </span>
            <h3 className="mt-0.5 text-base font-extrabold text-slate-900 sm:text-lg">
              {cfg.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Pemeriksaan terakhir: {formatDateTimeId(status.checkedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white px-3.5 py-2 text-right shadow-2xs">
          <p className="text-[10px] font-semibold uppercase text-slate-400">
            Total Skor Risiko
          </p>
          <p className="text-xl font-black text-slate-900">
            {status.totalScore}{" "}
            <span className="text-xs font-medium text-slate-400">poin</span>
          </p>
        </div>
      </div>

      {/* Risk Threshold Meter */}
      <div className="mt-4">
        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
          <span>0 (Sehat)</span>
          <span>20 (Waspada)</span>
          <span>40+ (Bahaya PMK)</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/90 ring-1 ring-slate-200/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.scoreBar}`}
            style={{ width: `${Math.max(4, meterPercent)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-xl bg-white/90 p-4 ring-1 ring-slate-200/60">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Ringkasan Evaluasi AI
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {status.summary}
          </p>
        </div>

        {status.triggeredIndicators &&
          status.triggeredIndicators.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Gejala &amp; Sinyal Anomali Terdeteksi
              </p>
              <ul className="mt-1.5 space-y-1">
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

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Protokol Penanganan Mandiri Peternak
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">
            {status.recommendedAction}
          </p>
        </div>

        {status.riskLevel !== "HIJAU" && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5 text-white ${
              status.riskLevel === "MERAH" ? "bg-rose-600" : "bg-amber-600"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm">
              <MessageCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">
                  Laporan 1-Klik WhatsApp ke {vetClinicName}
                </p>
                <p className="text-xs opacity-90">
                  Pesan ringkasan klinis disusun otomatis oleh AI (tanpa perlu
                  akun dokter hewan).
                </p>
              </div>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-xs transition-colors hover:bg-slate-100"
            >
              Kirim WA Darurat &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
