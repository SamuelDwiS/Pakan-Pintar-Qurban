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

