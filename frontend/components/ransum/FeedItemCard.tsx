"use client";

import React from "react";
import { Leaf, Trash2, Wheat } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import type { FeedItem } from "@/types";

interface FeedItemCardProps {
  feed: FeedItem;
  showEfficiency?: boolean;
  stockLabel?: string;
  stockTooltip?: string;
  stockUnit?: string;
  maxStockLimit?: number;
  onToggleActive: (id: string, isActive: boolean) => void;
  onChangePrice: (id: string, pricePerKg: number) => void;
  onChangeMaxLimit: (id: string, maxLimitKg: number) => void;
  onDeleteCustom?: (id: string) => void;
}

function FeedNumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  className,
  placeholder = "0",
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}) {
  const [localVal, setLocalVal] = React.useState<string>(
    value === 0 ? "0" : String(value)
  );

  React.useEffect(() => {
    const parsed = parseFloat(localVal);
    if ((isNaN(parsed) && value !== 0) || (!isNaN(parsed) && parsed !== value)) {
      setLocalVal(value === 0 ? "0" : String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Hapus angka 0 di depan jika diikuti angka lain (misal: "05" -> "5", "0100" -> "100")
    if (/^0[0-9]/.test(raw)) {
      raw = raw.replace(/^0+/, "");
      if (raw === "") raw = "0";
    }

    setLocalVal(raw);

    if (raw === "" || raw === "-") {
      onChange(0);
      return;
    }

    const num = parseFloat(raw);
    if (!isNaN(num)) {
      let finalNum = num;
      if (min !== undefined && finalNum < min) finalNum = min;
      if (max !== undefined && finalNum > max) finalNum = max;
      onChange(finalNum);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Otomatis select all agar saat nilai 0 langsung tergantikan dengan ketikan baru
    e.target.select();
  };

  const handleBlur = () => {
    if (localVal === "" || isNaN(parseFloat(localVal))) {
      setLocalVal("0");
      onChange(0);
    } else {
      const num = parseFloat(localVal);
      setLocalVal(String(num));
    }
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={localVal}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

const CATEGORY_BADGES: Record<
  FeedItem["category"],
  { label: string; style: string }
> = {
  Hijauan: {
    label: "Hijauan",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  Konsentrat: {
    label: "Konsentrat",
    style: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  "Limbah Pertanian": {
    label: "Limbah Pertanian",
    style: "bg-amber-50 text-amber-800 ring-amber-200",
  },
};

export function FeedItemCard({
  feed,
  showEfficiency = false,
  stockLabel = "Stok Tersedia (kg/hari)",
  stockTooltip = "Jumlah stok pakan maksimal yang dimiliki peternak untuk sapi ini per hari",
  stockUnit = "kg",
  maxStockLimit = 100000,
  onToggleActive,
  onChangePrice,
  onChangeMaxLimit,
  onDeleteCustom,
}: FeedItemCardProps) {
  const cat = CATEGORY_BADGES[feed.category];

  // Kalkulasi AI Cost-per-Nutrient berbasis Bahan Kering (Dry Matter Basis)
  const bkFraction = Math.max(0.01, feed.bkPercent / 100);
  const pkKgPerAsFedKg = bkFraction * Math.max(0.005, feed.pkPercent / 100);
  const tdnKgPerAsFedKg = bkFraction * Math.max(0.01, feed.tdnPercent / 100);

  const costPerKgPk = Math.round(feed.pricePerKg / pkKgPerAsFedKg);
  const costPerKgTdn = Math.round(feed.pricePerKg / tdnKgPerAsFedKg);

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        feed.isActive
          ? "border-emerald-200 bg-white shadow-2xs"
          : "border-slate-200 bg-slate-50/70 opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
              feed.category === "Hijauan"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {feed.category === "Hijauan" ? (
              <Leaf className="h-4 w-4" />
            ) : (
              <Wheat className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">{feed.name}</h3>
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${cat.style}`}
              >
                {cat.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-500">
              BK {feed.bkPercent}% &bull; PK {feed.pkPercent}% &bull; TDN{" "}
              {feed.tdnPercent}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Ketersediaan */}
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={feed.isActive}
              onChange={(e) => onToggleActive(feed.id, e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs font-semibold text-slate-700">
              {feed.isActive ? "Stok Ada" : "Kosong"}
            </span>
          </label>

          {feed.isCustom && onDeleteCustom && (
            <button
              type="button"
              onClick={() => onDeleteCustom(feed.id)}
              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              title="Hapus pakan tambahan"
              aria-label={`Hapus ${feed.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Indeks Efisiensi Nutrisi AI */}
      {showEfficiency && (
        <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 px-2.5 py-2 text-[11px]">
          <div>
            <span className="text-slate-500">Biaya Protein Murni:</span>
            <p className="font-bold text-slate-800">
              {formatRupiah(costPerKgPk)}/kg PK
            </p>
          </div>
          <div>
            <span className="text-slate-500">Biaya Energi TDN:</span>
            <p className="font-bold text-emerald-800">
              {formatRupiah(costPerKgTdn)}/kg TDN
            </p>
          </div>
        </div>
      )}

      {/* Input Harga Pasar & Batas Maksimum */}
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600">
            Harga Pasar (Rp/kg)
          </label>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs font-semibold text-slate-400">
              Rp
            </span>
            <FeedNumberInput
              min={0}
              step={50}
              disabled={!feed.isActive}
              value={feed.pricePerKg}
              onChange={(val) => onChangePrice(feed.id, val)}
              className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-2.5 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none disabled:bg-slate-100"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-[11px] font-semibold text-slate-600 truncate"
            title={stockTooltip}
          >
            {stockLabel}
          </label>
          <div className="relative mt-1">
            <FeedNumberInput
              min={0}
              max={maxStockLimit}
              step={0.5}
              disabled={!feed.isActive}
              value={feed.maxLimitKg}
              onChange={(val) => onChangeMaxLimit(feed.id, val)}
              className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-2.5 pr-8 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:outline-none disabled:bg-slate-100"
            />
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[11px] font-medium text-slate-400">
              {stockUnit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
