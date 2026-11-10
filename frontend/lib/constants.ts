import type {
  BarnItem,
  BreedItem,
  CattleProfile,
  FarmSettings,
  FeedItem,
  HealthStatus,
  StoredUserAccount,
  VetContactItem,
} from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Akun Demo Peternak Mandiri (1 Role Fokus Peternak)
export const DEFAULT_DEMO_ACCOUNTS: StoredUserAccount[] = [
  {
    id: "user-peternak-01",
    name: "Bpk. Slamet Riyadi",
    identifier: "peternak@pakanpintar.id",
    password: "password123",
    farmName: "Peternakan Berkah Mandiri — Boyolali",
  },
];

// ================= DATA MASTER BAWAAN =================

export const DEFAULT_VET_CONTACTS: VetContactItem[] = [
  {
    id: "vet-1",
    name: "Pak Mantri Budi",
    phone: "6281390375757",
    roleNote: "Mantri Langganan Utama (Desa)",
    isPrimary: true,
  },
  {
    id: "vet-2",
    name: "drh. Hendra Wijaya",
    phone: "6281234567890",
    roleNote: "Puskeswan / Medik Veteriner Kecamatan",
    isPrimary: false,
  },
  {
    id: "vet-3",
    name: "Pak Mantri Yanto",
    phone: "6285678901234",
    roleNote: "Mantri Cadangan (Suntik / IB)",
    isPrimary: false,
  },
];

export const DEFAULT_FARM_SETTINGS: FarmSettings = {
  defaultTargetDateQurban: "2027-05-17", // Estimasi Idul Adha 1448 H
  vetWhatsappNumber: "6281390375757",
  vetClinicName: "Puskeswan / Medik Veteriner Terdekat",
  vetContacts: DEFAULT_VET_CONTACTS,
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

// Seed Database Pakan Lokal Sesuai Hasil Temuan Peternak di Lapangan
export const DEFAULT_LOCAL_FEEDS: FeedItem[] = [
  {
    id: "feed_rumput",
    name: "Rumput Segar",
    category: "Hijauan",
    bkPercent: 21.0,
    pkPercent: 9.5,
    tdnPercent: 55.0,
    maxLimitKg: 40.0,
    pricePerKg: 500,
    isActive: true,
  },
  {
    id: "feed_dami",
    name: "Dami (Jerami Padi)",
    category: "Limbah Pertanian",
    bkPercent: 86.0,
    pkPercent: 4.5,
    tdnPercent: 43.0,
    maxLimitKg: 8.0,
    pricePerKg: 400,
    isActive: true,
  },
  {
    id: "feed_nutrifeed",
    name: "Nutrifeed (Konsentrat)",
    category: "Konsentrat",
    bkPercent: 88.0,
    pkPercent: 14.5,
    tdnPercent: 70.0,
    maxLimitKg: 50.0,
    pricePerKg: 2400, // 120k / 50kg (1/2 Kwintal)
    isActive: true,
  },
  {
    id: "feed_polar",
    name: "Bran Polar",
    category: "Konsentrat",
    bkPercent: 88.5,
    pkPercent: 15.5,
    tdnPercent: 74.0,
    maxLimitKg: 50.0,
    pricePerKg: 7000, // 350k / 50kg (1/2 Kwintal)
    isActive: true,
  },
  {
    id: "feed_katul",
    name: "Katul (Dedak Padi)",
    category: "Konsentrat",
    bkPercent: 88.0,
    pkPercent: 11.5,
    tdnPercent: 65.0,
    maxLimitKg: 50.0,
    pricePerKg: 3000, // 150k / 50kg (1/2 Kwintal)
    isActive: true,
  },
  {
    id: "feed_ampas_tahu",
    name: "Ampas Tahu",
    category: "Konsentrat",
    bkPercent: 14.0,
    pkPercent: 22.0,
    tdnPercent: 76.0,
    maxLimitKg: 25.0,
    pricePerKg: 10000, // 50k / 1 Ember (4-5 Liter / ~5 kg)
    isActive: true,
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
    name: "Sapi 1",
    barnId: "kandang-a",
    stallNumber: "Patok 01",
    breed: "Simental Cross",
    earTag: "Coklat kepala putih • Tag #014",
    initialWeightKg: 295,
    currentWeightKg: 325,
    targetWeightKg: 485,
    startDate: "2026-10-01",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-1",
        date: "2026-10-01",
        weightKg: 295,
        note: "Penimbangan awal masuk Kandang Utama A",
      },
      {
        id: "log-2",
        date: "2026-10-10",
        weightKg: 303,
        note: "Adaptasi pakan hijauan & konsentrat baik",
      },
      {
        id: "log-3",
        date: "2026-10-20",
        weightKg: 312.5,
        note: "Nafsu makan stabil 100%",
      },
      {
        id: "log-4",
        date: "2026-10-30",
        weightKg: 321,
        note: "Pemberian obat cacing rutin",
      },
      {
        id: "log-5",
        date: "2026-11-05",
        weightKg: 325,
        note: "Penimbangan terbaru minggu ini",
      },
    ],
  },
  {
    id: "sapi-qurban-02",
    name: "Sapi 2",
    barnId: "kandang-a",
    stallNumber: "Patok 02",
    breed: "Limousin Cross",
    earTag: "Merah bata polos • Tag #015",
    initialWeightKg: 340,
    currentWeightKg: 374,
    targetWeightKg: 530,
    startDate: "2026-09-25",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-s1",
        date: "2026-09-25",
        weightKg: 340,
        note: "Bakalan masuk Kandang Utama A",
      },
      {
        id: "log-s2",
        date: "2026-10-12",
        weightKg: 356,
        note: "Respon konsentrat bungkil sawit sangat baik",
      },
      {
        id: "log-s3",
        date: "2026-11-05",
        weightKg: 374,
        note: "Pertumbuhan stabil sesuai target",
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
    initialWeightKg: 260,
    currentWeightKg: 281,
    targetWeightKg: 410,
    startDate: "2026-10-05",
    targetDateQurban: "2027-05-17",
    weightLogs: [
      {
        id: "log-j1",
        date: "2026-10-05",
        weightKg: 260,
        note: "Sapi PO lokal masuk penggemukan",
      },
      {
        id: "log-j2",
        date: "2026-10-22",
        weightKg: 271.5,
        note: "Pemberian vitamin & mineral blok",
      },
      {
        id: "log-j3",
        date: "2026-11-05",
        weightKg: 281,
        note: "Kondisi sehat & lincah",
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
    summary: "SEHAT & NORMAL. Tidak ditemukan tanda fisik penyakit maupun mogok makan.",
    recommendedAction:
      "Lanjutkan rutinitas pemberian pakan pokok (rumput & dami) serta adukan konsentrat harian.",
    actionSteps: [
      "Beri pakan segar & adukan konsentrat sesuai porsi hari ini (bagi 2x: pagi & sore).",
      "Pastikan ketersediaan air minum bersih selalu penuh di bak/ember (ad libitum).",
      "Bersihkan sisa pakan yang mulai masam di palungan setiap pagi.",
      "Lakukan penimbangan berkala 1–2 minggu sekali untuk memantau tren target kurban.",
    ],
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