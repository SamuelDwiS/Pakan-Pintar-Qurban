import type {
  BarnItem,
  BreedItem,
  CattleProfile,
  FarmSettings,
  FeedItem,
  HealthStatus,
  StoredUserAccount,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Akun Demo Peternak Mandiri (1 Role Fokus Peternak)
export const DEFAULT_DEMO_ACCOUNTS: StoredUserAccount[] = [
  {
    id: "user-peternak-01",
    name: "Bpk. Sutrisno",
    identifier: "peternak@pakanpintar.id",
    password: "password123",
    farmName: "Peternakan Berkah Mandiri — Sragen, Jawa Tengah",
  },
];

// ================= DATA MASTER BAWAAN =================

export const DEFAULT_FARM_SETTINGS: FarmSettings = {
  defaultTargetDateQurban: "2027-05-17", // Estimasi Idul Adha 1448 H
  vetWhatsappNumber: "6281390375757",
  vetClinicName: "Mantri Hewan / Puskeswan Terdekat",
  // Data harga pasar kurban (dari wawancara lapangan Sragen 2026)
  pricePerKwintalNormal: 55_000_000,       // Rp 55 jt/kwintal (hari biasa)
  pricePerKwintalEid: 80_000_000,          // Rp 80 jt/kwintal (menjelang Idul Adha)
  maxQurbanWeightKg: 700,                  // Bobot maks layak kurban: 7 kwintal
};

export const DEFAULT_BARNS: BarnItem[] = [
  {
    id: "kandang-a",
    name: "Kandang Utama A",
    capacity: 10,
    type: "Individu / Tambat",
    locationNote: "Blok depan — khusus sapi penggemukan target kurban jumbo",
  },
  {
    id: "kandang-b",
    name: "Kandang Blok B",
    capacity: 8,
    type: "Koloni",
    locationNote: "Blok tengah — sapi bakalan lokal & PO",
  },
  {
    id: "kandang-isolasi",
    name: "Kandang Isolasi",
    capacity: 3,
    type: "Individu / Tambat",
    locationNote: "Terpisah 20 meter untuk karantina ternak baru / sakit",
  },
];

export const DEFAULT_BREEDS: BreedItem[] = [
  {
    id: "breed-sim",
    name: "Simental Cross",
    code: "SIM",
    normalAdgKg: 1.2,
    maxBiologicalAdgKg: 1.5,
    description: "Sapi potong persilangan Eropa bertubuh besar, responsif konsentrat.",
  },
  {
    id: "breed-lim",
    name: "Limousin Cross",
    code: "LIM",
    normalAdgKg: 1.2,
    maxBiologicalAdgKg: 1.5,
    description: "Perototan padat dengan persentase karkas kurban tinggi.",
  },
  {
    id: "breed-bx",
    name: "Brahman Cross (BX)",
    code: "BX",
    normalAdgKg: 1.05,
    maxBiologicalAdgKg: 1.4,
    description: "Tahan panas tropis dan adaptif terhadap pakan serat lokal.",
  },
  {
    id: "breed-po",
    name: "Peranakan Ongole (PO)",
    code: "PO",
    normalAdgKg: 0.85,
    maxBiologicalAdgKg: 1.15,
    description: "Sapi putih lokal/Jawa, tahan penyakit dan efisien pakan hijauan.",
  },
  {
    id: "breed-bali",
    name: "Sapi Bali",
    code: "BAL",
    normalAdgKg: 0.7,
    maxBiologicalAdgKg: 0.95,
    description: "Sapi asli Indonesia favorit kurban, karkas kompak & rendah lemak.",
  },
  {
    id: "breed-madura",
    name: "Sapi Madura",
    code: "MAD",
    normalAdgKg: 0.65,
    maxBiologicalAdgKg: 0.9,
    description: "Postur sedang-kompak, sangat tahan kondisi pakan kering.",
  },
];

// Kompatibilitas dropdown statis jika diperlukan
export const CATTLE_BREEDS = DEFAULT_BREEDS.map((b) => ({
  value: b.name,
  label: `${b.name} (${b.code})`,
  typicalMaxAdg: b.normalAdgKg,
}));

// Seed Database Pakan Lokal — Diperbarui berdasarkan wawancara peternak Sragen 2026
// Referensi lapangan: 1 ember = ±3,6–4 kg / 1 sapi / sekali makan
// Pakan nyata: Pollar Cilacap, NutriFeed, Ampas Tahu, Katul
export const DEFAULT_LOCAL_FEEDS: FeedItem[] = [
  // ── HIJAUAN ────────────────────────────────────────────────────────────────
  {
    id: "feed_1",
    name: "Rumput Lapang",
    category: "Hijauan",
    bkPercent: 24.4,
    pkPercent: 8.0,
    tdnPercent: 56.2,
    maxLimitKg: 60.0,
    pricePerKg: 400,
    isActive: true,
  },
  {
    id: "feed_2",
    name: "Rumput Gajah / Odot",
    category: "Hijauan",
    bkPercent: 21.0,
    pkPercent: 9.5,
    tdnPercent: 55.0,
    maxLimitKg: 60.0,
    pricePerKg: 500,
    isActive: false,
  },

  // ── KONSENTRAT PABRIKAN (HASIL WAWANCARA LAPANGAN SRAGEN) ──────────────────
  {
    id: "feed_8",
    name: "Pollar Cilacap (Dedak Gandum)",
    category: "Konsentrat",
    // Dedak gandum: BK ~88%, PK ~16%, TDN ~72% — referensi Hartadi et al.
    bkPercent: 88.0,
    pkPercent: 16.0,
    tdnPercent: 72.0,
    // Dosis rekomendasi harian: ~0.5 - 1.0 kg/ekor/hari
    maxLimitKg: 1.0,
    pricePerKg: 2500,
    isActive: true,
  },
  {
    id: "feed_9",
    name: "NutriFeed Konsentrat",
    category: "Konsentrat",
    // Konsentrat komersial berbasis biji-bijian: BK ~87%, PK ~14%, TDN ~70%
    bkPercent: 87.0,
    pkPercent: 14.0,
    tdnPercent: 70.0,
    // Dosis rekomendasi harian: ~1.4 - 2.5 kg/ekor/hari
    maxLimitKg: 2.5,
    pricePerKg: 4500,
    isActive: true,
  },

  // ── LIMBAH INDUSTRI PANGAN ─────────────────────────────────────────────────
  {
    id: "feed_7",
    name: "Ampas Tahu Basah",
    category: "Limbah Pertanian",
    bkPercent: 14.5,
    pkPercent: 20.0,
    tdnPercent: 76.0,
    // Dosis rekomendasi harian: ~3.5 - 6.0 kg/ekor/hari (diberikan 2x sehari)
    maxLimitKg: 6.0,
    pricePerKg: 1200,
    isActive: true,
  },

  // ── BEKATUL / DEDAK ─────────────────────────────────────────────────────────
  {
    id: "feed_6",
    name: "Katul / Bekatul Padi",
    category: "Konsentrat",
    bkPercent: 87.7,
    pkPercent: 12.0,
    tdnPercent: 67.9,
    // Dosis rekomendasi harian: ~1.0 - 2.0 kg/ekor/hari
    maxLimitKg: 2.0,
    pricePerKg: 3600,
    isActive: true,
  },

  // ── LIMBAH PERTANIAN LAIN (CADANGAN) ──────────────────────────────────────
  {
    id: "feed_3",
    name: "Bungkil Inti Sawit",
    category: "Konsentrat",
    bkPercent: 90.3,
    pkPercent: 16.8,
    tdnPercent: 79.0,
    maxLimitKg: 4.0,
    pricePerKg: 1750,
    isActive: false,
  },
  {
    id: "feed_4",
    name: "Tumpi Jagung",
    category: "Limbah Pertanian",
    bkPercent: 88.3,
    pkPercent: 8.87,
    tdnPercent: 51.2,
    maxLimitKg: 3.0,
    pricePerKg: 1000,
    isActive: false,
  },
  {
    id: "feed_5",
    name: "Janggel Jagung Giling",
    category: "Limbah Pertanian",
    bkPercent: 85.0,
    pkPercent: 3.4,
    tdnPercent: 52.0,
    maxLimitKg: 2.0,
    pricePerKg: 500,
    isActive: false,
  },
];

// ================= GEJALA KLINIS KIAT VETINDO PMK =================

export interface ClinicalSymptomMeta {
  key:
    | "airLiurBerlebih"
    | "lepuhMulutKaki"
    | "pincang"
    | "demam"
    | "diare";
  title: string;
  description: string;
  score: number;
  isCritical?: boolean;
}

export const CLINICAL_SYMPTOMS: ClinicalSymptomMeta[] = [
  {
    key: "lepuhMulutKaki",
    title: "Lepuh pada Mulut / Lidah / Gusi / Kaki",
    description:
      "Terdapat luka lepuh (vesikel) atau erosi kemerahan di sekitar rongga mulut, moncong, atau celah kuku.",
    score: 40,
    isCritical: true,
  },
  {
    key: "airLiurBerlebih",
    title: "Air Liur Berlebih & Menggantung (Hipersalivasi)",
    description:
      "Keluar air liur berbusa/menggantung seperti benang dari mulut disertai suara mengecap.",
    score: 30,
    isCritical: true,
  },
  {
    key: "pincang",
    title: "Pincang / Tumpuan Kaki Lemah",
    description:
      "Sapi enggan berdiri, sering mengangkat salah satu kaki, atau berjalan pincang akibat nyeri kuku.",
    score: 20,
  },
  {
    key: "demam",
    title: "Demam Tinggi / Tubuh & Telinga Terasa Panas",
    description:
      "Suhu rektal >39.5°C, moncong kering, ternak tampak lesu dan memisahkan diri.",
    score: 15,
  },
  {
    key: "diare",
    title: "Diare / Kotoran Encer",
    description:
      "Konsistensi feses cair tidak normal dalam 24 jam terakhir.",
    score: 10,
  },
];

// ================= DAFTAR SAPI AWAL DEMO =================
// Menampilkan contoh penamaan otomatis ("Sapi 1", "Sapi 2") & penamaan bebas ("Sapi 3 - Bima")

export const DEFAULT_CATTLE_LIST: CattleProfile[] = [
  {
    id: "sapi-qurban-01",
    name: "Sapi 1 (Jono)",
    barnId: "kandang-a",
    stallNumber: "Patok 01",
    breed: "Simental Cross",
    earTag: "Coklat kepala putih • Tag #014",
    initialWeightKg: 350,
    currentWeightKg: 388,
    targetWeightKg: 550,
    startDate: "2026-10-01",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-1",
        date: "2026-10-01",
        weightKg: 350,
        note: "Penimbangan awal masuk kandang — adaptasi lingkungan baru",
      },
      {
        id: "log-2",
        date: "2026-10-30",
        weightKg: 378,
        note: "Selesai masa adaptasi ±2 bulan, nafsu makan membaik",
      },
      {
        id: "log-3",
        date: "2026-11-05",
        weightKg: 388,
        note: "PBBH rata-rata harian ±1 kg/hari sesuai lapangan",
      },
    ],
  },
  {
    id: "sapi-qurban-02",
    name: "Sapi 2 (Bagong)",
    barnId: "kandang-a",
    stallNumber: "Patok 02",
    breed: "Limousin Cross",
    earTag: "Merah bata polos • Tag #015",
    initialWeightKg: 400,
    currentWeightKg: 436,
    targetWeightKg: 600,
    startDate: "2026-10-01",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-s1",
        date: "2026-10-01",
        weightKg: 400,
        note: "Bakalan masuk Kandang Utama A",
      },
      {
        id: "log-s2",
        date: "2026-10-30",
        weightKg: 420,
        note: "Respon konsentrat NutriFeed sangat baik",
      },
      {
        id: "log-s3",
        date: "2026-11-05",
        weightKg: 436,
        note: "Pertumbuhan stabil ~1 kg/hari",
      },
    ],
  },
  {
    id: "sapi-qurban-03",
    name: "Sapi 3 (Si Putih)",
    barnId: "kandang-b",
    stallNumber: "Koloni B",
    breed: "Peranakan Ongole (PO)",
    earTag: "Putih berpunuk besar",
    initialWeightKg: 280,
    currentWeightKg: 308,
    targetWeightKg: 450,
    startDate: "2026-10-05",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-j1",
        date: "2026-10-05",
        weightKg: 280,
        note: "Sapi PO lokal masuk penggemukan",
      },
      {
        id: "log-j2",
        date: "2026-10-30",
        weightKg: 299,
        note: "Pemberian vitamin & katul ditingkatkan",
      },
      {
        id: "log-j3",
        date: "2026-11-05",
        weightKg: 308,
        note: "Kondisi sehat & lincah, kuku bersih",
      },
    ],
  },
];

export const DEFAULT_CATTLE_PROFILE: CattleProfile = DEFAULT_CATTLE_LIST[0];

export function createDefaultHealthStatus(cattleId: string): HealthStatus {
  return {
    cattleId,
    totalScore: 0,
    riskLevel: "HIJAU",
    riskBadgeColor: "green",
    summary: "Kondisi klinis dan nafsu makan ternak terpantau sehat/normal.",
    recommendedAction:
      "Lanjutkan pemberian ransum harian terjadwal, jaga kebersihan kandang, dan lakukan penimbangan berkala.",
    checkedAt: "2026-11-05T08:00:00.000Z",
    triggeredIndicators: [],
    source: "fallback",
  };
}

export const DEFAULT_HEALTH_STATUS: HealthStatus =
  createDefaultHealthStatus("sapi-qurban-01");

export const NUTRIENT_GLOSSARY = [
  {
    term: "BK (Bahan Kering)",
    short: "Berat pakan tanpa kandungan air",
    detail:
      "Bagian pakan sesungguhnya yang mengandung nutrisi setelah dikurangi kadar air. Sapi butuh minimal ~2.5%–3% dari bobot badannya per hari.",
  },
  {
    term: "PK (Protein Kasar)",
    short: "Zat pembentuk otot & daging",
    detail:
      "Nutrisi utama untuk membangun jaringan otot sapi potong agar pertambahan bobot (PBBH) optimal.",
  },
  {
    term: "TDN (Total Digestible Nutrients)",
    short: "Total energi pakan yang tercerna",
    detail:
      "Ukuran total energi dari pakan yang benar-benar bisa diserap tubuh sapi untuk hidup pokok dan penggemukan.",
  },
  {
    term: "PBBH / ADG",
    short: "Pertambahan Bobot Badan Harian",
    detail:
      "Rata-rata kenaikan berat sapi per hari (kg/hari). Batas biologis normal berbeda tiap bangsa sapi (misal Sapi Bali ~0.95 kg/hari, Simental ~1.5 kg/hari).",
  },
  {
    term: "As-Fed (Pakan Segar)",
    short: "Berat pakan apa adanya saat ditimbang di kandang",
    detail:
      "Takaran nyata (masih mengandung air) yang langsung Anda timbang dan berikan ke palung pakan sapi.",
  },
] as const;
