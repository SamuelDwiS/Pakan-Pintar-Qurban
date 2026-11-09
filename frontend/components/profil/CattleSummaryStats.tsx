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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
      <StatMetricCard
        label="Populasi"
        value={`${totalCattle} Ekor`}
        subtext="Terdaftar di kandang"
        icon={<Layers className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="emerald"
      />

      <StatMetricCard
        label="Biaya Pakan"
        value={`${formatRupiah(totalBarnDailyCost)}/hr`}
        subtext="Seluruh sapi kandang"
        icon={<Coins className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="sky"
        badgeText="Semua"
      />

      <StatMetricCard
        label="Progres Kurban"
        value={`${avgProgressPercent}%`}
        subtext="Rata-rata target bobot"
        icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone="slate"
      />

      <StatMetricCard
        label="Kesehatan"
        value={alertCount === 0 ? "Semua Sehat" : `${alertCount} Cek`}
        subtext={
          alertCount === 0
            ? "Seluruh ternak aman"
            : "Ada sapi berisiko"
        }
        icon={<Activity className="h-4 w-4 sm:h-5 sm:w-5" />}
        tone={alertCount === 0 ? "emerald" : "rose"}
      />
    </div>
  );
}
