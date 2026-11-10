// ============================================================================
// Domain Types & Interfaces — Pakan Pintar Qurban
// Arsitektur Single-Role (Peternak Mandiri) + Data Master Terintegrasi
// ============================================================================

export type RiskLevel = "HIJAU" | "KUNING" | "MERAH";
export type RiskBadgeColor = "green" | "yellow" | "red";

export interface AuthUser {
  id: string;
  name: string;
  identifier: string; // Email atau No. HP Peternak
  farmName: string;
}

export interface StoredUserAccount extends AuthUser {
  password: string;
}

// ================= DATA MASTER =================

export type BarnType = "Individu / Tambat" | "Koloni";

export interface BarnItem {
  id: string;
  name: string;
  capacity: number;
  type: BarnType;
  locationNote?: string;
}

export interface BreedItem {
  id: string;
  name: string;
  code: string; // Contoh: SIM, LIM, PO, BAL
  normalAdgKg: number;
  maxBiologicalAdgKg: number;
  description?: string;
}

export interface VetContactItem {
  id: string;
  name: string; // Contoh: Pak Mantri Budi, drh. Hendra
  phone: string; // Format 628xxx
  roleNote?: string; // Contoh: Mantri Langganan Utama, Puskeswan Kecamatan, Mantri Cadangan
  isPrimary?: boolean;
}

export interface FarmSettings {
  defaultTargetDateQurban: string; // YYYY-MM-DD
  vetWhatsappNumber: string; // Contoh: 6281234567890 (fallback)
  vetClinicName: string; // Contoh: Puskeswan Kecamatan / Mantri Hewan
  vetContacts?: VetContactItem[]; // Daftar kontak mantri langganan (hingga 3 mantri)
}

export interface FeedItem {
  id: string;
  name: string;
  category: "Hijauan" | "Konsentrat" | "Limbah Pertanian";
  bkPercent: number;
  pkPercent: number;
  tdnPercent: number;
  maxLimitKg: number;
  pricePerKg: number;
  isActive: boolean;
  isCustom?: boolean;
}

// ================= DATA OPERASIONAL TERNAK =================

export interface WeightLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
}

export interface CattleProfile {
  id: string;
  name: string; // Otomatis "Sapi 1", "Sapi 2", atau nama bebas dari peternak
  barnId: string; // Relasi ke BarnItem.id
  stallNumber?: string; // Nomor Patok / Sekat (opsional)
  breed: string; // Nama ras dari BreedItem
  earTag?: string; // Nomor Ear Tag / Kalung / Ciri fisik (opsional)
  initialWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  startDate: string; // YYYY-MM-DD
  targetDateQurban: string; // YYYY-MM-DD
  weightLogs: WeightLogEntry[];
}

export interface RationCompositionItem {
  feedId: string;
  feedName: string;
  amountAsFedKg: number;
  amountBkKg: number;
  costRp: number;
}

export interface NutrientRequirement {
  bkReqKg: number;
  pkReqKg: number;
  tdnReqKg: number;
}

export interface OptimizationResult {
  status: string;
  cattleId: string;
  adgRequiredKg: number;
  maxBiologicalAdgKg?: number;
  isAdgFeasible: boolean;
  totalCostPerDayRp: number;
  totalCostToQurbanRp: number;
  totalBkProvidedKg: number;
  totalPkProvidedKg: number;
  totalTdnProvidedKg: number;
  requirements?: NutrientRequirement;
  rationComposition: RationCompositionItem[];
  warningMessage?: string;
  source?: "backend" | "fallback";
}

export interface HealthChecklistForm {
  cattleId: string;
  airLiurBerlebih: boolean;
  lepuhMulutKaki: boolean;
  pincang: boolean;
  demam: boolean;
  diare: boolean;
  penurunanPakanPercent: number;
  penurunanBobotPercent: number;
  catatanTambahan?: string;
}

export interface FeedAdjustmentItem {
  feedName: string; // contoh: Bran Polar, Nutrifeed, Ampas Tahu, Dami (Jerami Padi)
  adjustmentType: "TAMBAH" | "KURANGI" | "HINDARI_SEMENTARA" | "UTAMAKAN";
  suggestedDeltaKg?: number; // contoh: +0.5 kg
  note: string; // penjelasan operasional
}

export interface DietaryInterventionRecommendation {
  headline: string;
  clinicalReason: string;
  feedAdjustments: FeedAdjustmentItem[];
  practicalTips: string[];
  suggestedRationOverride?: {
    minPolarKg?: number;
    maxDamiKg?: number;
    maxAmpasTahuKg?: number;
    boostNutrifeedKg?: number;
  };
}

export interface HealthStatus {
  cattleId: string;
  totalScore: number;
  riskLevel: RiskLevel;
  riskBadgeColor: RiskBadgeColor;
  summary: string;
  recommendedAction: string;
  actionSteps?: string[];
  dietaryIntervention?: DietaryInterventionRecommendation;
  checkedAt: string; // ISO timestamp
  triggeredIndicators?: string[];
  catatanTambahan?: string;
  source?: "backend" | "fallback";
}

export interface GrowthTrajectoryPoint {
  label: string;
  date: string;
  dayIndex: number;
  idealWeightKg: number;
  actualWeightKg: number | null;
  predictedWeightKg: number;
}

// ============================================================================
// Backend REST API DTOs (snake_case sesuai Pydantic Schemas di SRS Section 3.3)
// ============================================================================

export interface ApiFeedItemDTO {
  feed_id: string;
  feed_name: string;
  bk_percent: number;
  pk_percent: number;
  tdn_percent: number;
  max_limit_kg: number;
  price_per_kg: number;
  is_active: boolean;
}

export interface ApiOptimizationRequestDTO {
  cattle_id: string;
  current_weight_kg: number;
  target_weight_kg: number;
  days_to_qurban: number;
  available_feeds: ApiFeedItemDTO[];
}

export interface ApiFeedRationResultDTO {
  feed_id: string;
  feed_name: string;
  amount_as_fed_kg: number;
  amount_bk_kg: number;
  cost_rp: number;
}

export interface ApiOptimizationResponseDTO {
  status: string;
  cattle_id: string;
  adg_required_kg: number;
  is_adg_feasible: boolean;
  total_cost_per_day_rp: number;
  total_cost_to_qurban_rp: number;
  total_bk_provided_kg: number;
  total_pk_provided_kg: number;
  total_tdn_provided_kg: number;
  ration_composition: ApiFeedRationResultDTO[];
  warning_message?: string | null;
}

export interface ApiHealthChecklistInputDTO {
  cattle_id: string;
  air_liur_berlebih: boolean;
  lepuh_mulut_kaki: boolean;
  pincang: boolean;
  demam: boolean;
  diare: boolean;
  penurunan_pakan_percent: number;
  penurunan_bobot_percent: number;
}

export interface ApiHealthScreeningResponseDTO {
  cattle_id: string;
  total_score: number;
  risk_level: RiskLevel;
  risk_badge_color: RiskBadgeColor;
  summary: string;
  recommendedAction?: string;
  recommended_action: string;
}
