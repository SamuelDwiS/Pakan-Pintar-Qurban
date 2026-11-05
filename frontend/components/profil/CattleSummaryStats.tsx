import React from "react";
import { Activity, Coins, Layers, TrendingUp } from "lucide-react";
import { StatMetricCard } from "@/components/ui/StatMetricCard";
import { formatRupiah } from "@/lib/formatters";
import type {
  CattleProfile,
  HealthStatus,
  OptimizationResult,
} from "@/types";

interface CattleSummaryStatsProps {
  cattleList: CattleProfile[];
  optimizationByCattleId: Record<string, OptimizationResult>;
  healthByCattleId: Record<string, HealthStatus>;
}

export function CattleSummaryStats({
  cattleList,
  optimizationByCattleId,
  healthByCattleId,
}: CattleSummaryStatsProps) {
  const totalCattle = cattleList.length;

  const totalBarnDailyCost = cattleList.reduce((acc, c) => {
    return acc + (optimizationByCattleId[c.id]?.totalCostPerDayRp ?? 0);
  }, 0);

  const avgProgressPercent =
    totalCattle > 0
      ? Math.round(
          cattleList.reduce((acc, c) => {
            const needed = Math.max(1, c.targetWeightKg - c.initialWeightKg);
            const gained = Math.max(0, c.currentWeightKg - c.initialWeightKg);
            return acc + Math.min(100, (gained / needed) * 100);
          }, 0) / totalCattle
        )
      : 0;

  const alertCount = cattleList.filter((c) => {
    const level = healthByCattleId[c.id]?.riskLevel ?? "HIJAU";
    return level !== "HIJAU";
  }).length;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <StatMetricCard
        label="Populasi Kandang"
        value={`${totalCattle} Ekor`}
        subtext="Sapi potong terdaftar di sistem"
        icon={<Layers className="h-5 w-5" />}
        tone="emerald"
      />

      <StatMetricCard
        label="Total Biaya Pakan Kandang"
        value={`${formatRupiah(totalBarnDailyCost)}/hr`}
        subtext="Akumulasi ransum seluruh sapi"
        icon={<Coins className="h-5 w-5" />}
        tone="sky"
        badgeText="Semua Sapi"
      />

      <StatMetricCard
        label="Rata-Rata Progres Kurban"
        value={`${avgProgressPercent}%`}
        subtext="Capaian rata-rata menuju target bobot"
        icon={<TrendingUp className="h-5 w-5" />}
        tone="slate"
      />

      <StatMetricCard
        label="Pantauan Kesehatan"
        value={alertCount === 0 ? "Semua Sehat" : `${alertCount} Perlu Cek`}
        subtext={
          alertCount === 0
            ? "Seluruh ternak berstatus HIJAU"
            : "Terdapat sapi berstatus Kuning/Merah"
        }
        icon={<Activity className="h-5 w-5" />}
        tone={alertCount === 0 ? "emerald" : "rose"}
      />
    </div>
  );
}

