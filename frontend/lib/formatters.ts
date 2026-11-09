/**
 * Utilitas pemformatan angka, mata uang Rupiah, dan tanggal Bahasa Indonesia
 */

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatKg(amount: number, decimals = 2): string {
  return `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(amount)} kg`;
}

export function formatIndonesianDate(isoDateStr: string): string {
  if (!isoDateStr) return "-";
  const d = new Date(
    isoDateStr.includes("T") ? isoDateStr : `${isoDateStr}T00:00:00`
  );
  if (Number.isNaN(d.getTime())) return isoDateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTimeId(isoStr: string): string {
  if (!isoStr) return "-";
  const d = new Date(isoStr);
  if (Number.isNaN(d.getTime())) return isoStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Konversi praktis takaran kandang lokal (Piring / Ember)
 * Berdasarkan wawancara peternak Sragen:
 * 1 Piring = 0.5 Liter (Pollar ~0.18 kg, NutriFeed ~0.28 kg, Katul ~0.165 kg, Ampas Tahu ~0.35 kg)
 * 1 Ember = 5 Liter (Campuran konsentrat & ampas ~3.6 - 4 kg)
 */
export function formatTakaranKandang(feedName: string, asFedKg: number): string {
  const lower = feedName.toLowerCase();
  if (lower.includes("pollar")) {
    const piring = asFedKg / 0.18;
    return `±${piring.toFixed(1)} piring`;
  }
  if (lower.includes("nutrifeed")) {
    const piring = asFedKg / 0.28;
    return `±${piring.toFixed(1)} piring`;
  }
  if (lower.includes("ampas tahu")) {
    const ember = asFedKg / 2.0;
    return `±${ember.toFixed(1)} ember (${(asFedKg / 0.35).toFixed(0)} piring)`;
  }
  if (lower.includes("katul") || lower.includes("bekatul") || lower.includes("dedak")) {
    const piring = asFedKg / 0.165;
    return `±${piring.toFixed(1)} piring`;
  }
  if (lower.includes("rumput")) {
    return `${formatKg(asFedKg, 1)} segar di palung`;
  }
  return formatKg(asFedKg, 1);
}

