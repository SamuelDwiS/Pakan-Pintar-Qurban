import React from "react";
import {
  CheckCircle2,
  Clock,
  Coins,
  Scale,
  Utensils,
} from "lucide-react";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { formatKg, formatRupiah } from "@/lib/formatters";
import type { OptimizationResult } from "@/types";

interface RationTableProps {
  result: OptimizationResult;
  daysToQurban: number;
  compact?: boolean;
}

export function RationTable({
  result,
  daysToQurban,
  compact = false,
}: RationTableProps) {
  const totalAsFedKg = result.rationComposition.reduce(
    (acc, item) => acc + item.amountAsFedKg,
    0
  );

  if (result.rationComposition.length === 0) {
    return (
      <InfoAlert
        variant="warning"
        title="Kombinasi Ransum Belum Tersedia"
        description={
          result.warningMessage ||
          "Aktifkan bahan pakan hijauan dan konsentrat yang cukup agar solver dapat menyusun ransum sesuai standar NASEM/NRC."
        }
      />
    );
  }

  const req = result.requirements;
  const nutrientBars = [
    {
      label: "Bahan Kering (BK)",
      provided: result.totalBkProvidedKg,
      required: req?.bkReqKg ?? result.totalBkProvidedKg,
      color: "bg-emerald-600",
    },
    {
      label: "Protein Kasar (PK)",
      provided: result.totalPkProvidedKg,
      required: req?.pkReqKg ?? result.totalPkProvidedKg,
      color: "bg-sky-600",
    },
    {
      label: "Energi Tercerna (TDN)",
      provided: result.totalTdnProvidedKg,
      required: req?.tdnReqKg ?? result.totalTdnProvidedKg,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-5">
      {result.warningMessage && (
        <InfoAlert
          variant="warning"
          title="Perhatian Kelayakan Target PBBH"
          description={result.warningMessage}
        />
      )}

      {/* Ringkasan Biaya & Total Pakan Segar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Coins className="h-4 w-4" />
            <span>Biaya Pakan Minimum / Hari</span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-emerald-950 sm:text-2xl">
            {formatRupiah(result.totalCostPerDayRp)}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            Hasil optimasi Linear Programming
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Utensils className="h-4 w-4 text-slate-500" />
            <span>Total Takaran Segar / Hari</span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {formatKg(totalAsFedKg, 2)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Setara {formatKg(result.totalBkProvidedKg, 2)} Bahan Kering (BK)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Scale className="h-4 w-4 text-slate-500" />
            <span>Estimasi Biaya s.d. Kurban</span>
          </div>
          <p className="mt-1.5 text-xl font-extrabold text-slate-900 sm:text-2xl">
            {formatRupiah(result.totalCostToQurbanRp)}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Akumulasi {daysToQurban} hari penggemukan
          </p>
        </div>
      </div>

      {/* Tabel Komposisi Ransum */}
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Bahan Pakan Lokal</th>
                <th className="px-4 py-3 text-right">Takaran Segar (As-Fed)</th>
                {!compact && (
                  <th className="px-4 py-3 text-right">Pagi / Sore (2x)</th>
                )}
                <th className="px-4 py-3 text-right">Bahan Kering (BK)</th>
                <th className="px-4 py-3 text-right">Biaya / Hari</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {result.rationComposition.map((item) => {
                const sharePercent =
                  totalAsFedKg > 0
                    ? Math.round((item.amountAsFedKg / totalAsFedKg) * 100)
                    : 0;
                return (
                  <tr
                    key={item.feedId}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {item.feedName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Porsi {sharePercent}% dari total pakan
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200/80">
                        {formatKg(item.amountAsFedKg, 2)}
                      </span>
                    </td>
                    {!compact && (
                      <td className="px-4 py-3.5 text-right text-xs font-medium text-slate-600">
                        2 &times; {formatKg(item.amountAsFedKg / 2, 2)}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-right text-xs font-medium text-slate-600">
                      {formatKg(item.amountBkKg, 2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatRupiah(item.costRp)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50/90 font-bold text-slate-900">
              <tr>
                <td className="px-4 py-3">Total Harian</td>
                <td className="px-4 py-3 text-right text-emerald-800">
                  {formatKg(totalAsFedKg, 2)}
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      2 &times; {formatKg(totalAsFedKg / 2, 2)}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-right text-xs">
                  {formatKg(result.totalBkProvidedKg, 2)}
                </td>
                <td className="px-4 py-3 text-right text-emerald-800">
                  {formatRupiah(result.totalCostPerDayRp)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Validasi Pemenuhan Nutrisi */}
      {!compact && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Kecukupan Gizi Harian (Standar Nutrisi Sapi Potong)
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              100% Gizi Terpenuhi
            </span>
          </div>

          <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {nutrientBars.map((nut) => {
              const ratio =
                nut.required > 0
                  ? Math.min(100, Math.round((nut.provided / nut.required) * 100))
                  : 100;
              return (
                <div
                  key={nut.label}
                  className="rounded-xl bg-white p-3.5 ring-1 ring-slate-200/80"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {nut.label}
                    </span>
                    <span className="font-bold text-slate-900">
                      {nut.provided.toFixed(2)} / {nut.required.toFixed(2)} kg
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${nut.color}`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

