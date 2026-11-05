"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";
import { buildGrowthTrajectory } from "@/lib/fallback-engines";
import { formatKg } from "@/lib/formatters";
import type { CattleProfile } from "@/types";

interface WeightChartProps {
  profile: CattleProfile;
}

export function WeightChart({ profile }: WeightChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { points, observedAdgKg, projectedFinalWeightKg } = useMemo(
    () => buildGrowthTrajectory(profile),
    [profile]
  );

  const isProjectedOnTrack =
    projectedFinalWeightKg >= profile.targetWeightKg * 0.98;

  return (
    <div className="space-y-4">
      {/* Ringkasan Proyeksi Adaptif ML */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">
              Estimasi PBBH Adaptif (Ridge Regression)
            </p>
            <p className="text-sm font-bold text-slate-900">
              {observedAdgKg.toFixed(2)} kg / hari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">
              Proyeksi Bobot Saat Idul Adha
            </p>
            <p
              className={`text-sm font-bold ${
                isProjectedOnTrack ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {formatKg(projectedFinalWeightKg, 1)}{" "}
              <span className="text-xs font-medium text-slate-500">
                (Target {formatKg(profile.targetWeightKg, 0)})
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grafik Recharts */}
      <div className="h-72 w-full sm:h-80">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={points}
              margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickMargin={8}
              />
              <YAxis
                domain={["dataMin - 15", "dataMax + 15"]}
                tick={{ fontSize: 11, fill: "#64748b" }}
                unit=" kg"
                width={58}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                }}
                formatter={(value, name) => [
                  `${Number(value).toFixed(1)} kg`,
                  String(name),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <ReferenceLine
                y={profile.targetWeightKg}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: `Target ${profile.targetWeightKg} kg`,
                  position: "insideTopRight",
                  fill: "#b45309",
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="idealWeightKg"
                name="Jalur Target Ideal"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="predictedWeightKg"
                name="Proyeksi Adaptif AI"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actualWeightKg"
                name="Timbangan Aktual"
                stroke="#0284c7"
                strokeWidth={3}
                connectNulls
                dot={{ r: 5, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100/70 text-xs font-medium text-slate-400">
            Memuat grafik pertumbuhan ternak...
          </div>
        )}
      </div>
    </div>
  );
}

