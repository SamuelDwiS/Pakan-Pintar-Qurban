import { API_BASE_URL, DEFAULT_LOCAL_FEEDS } from "@/lib/constants";
import {
  calculateNutrientRequirements,
  evaluateHealthFallback,
  optimizeRationFallback,
} from "@/lib/fallback-engines";
import type {
  ApiFeedItemDTO,
  ApiHealthChecklistInputDTO,
  ApiHealthScreeningResponseDTO,
  ApiOptimizationRequestDTO,
  ApiOptimizationResponseDTO,
  FeedItem,
  HealthChecklistForm,
  HealthStatus,
  OptimizationResult,
} from "@/types";

const REQUEST_TIMEOUT_MS = 4500;

function inferFeedCategory(
  name: string
): "Hijauan" | "Konsentrat" | "Limbah Pertanian" {
  const lower = name.toLowerCase();
  if (lower.includes("rumput") || lower.includes("hijauan")) return "Hijauan";
  if (lower.includes("tumpi") || lower.includes("janggel") || lower.includes("jerami")) {
    return "Limbah Pertanian";
  }
  return "Konsentrat";
}

async function fetchWithTimeout(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET /api/v1/feeds/default
 * Mengambil daftar master pakan lokal dari FastAPI, dengan fallback ke DEFAULT_LOCAL_FEEDS
 */
export async function getDefaultFeeds(): Promise<{
  feeds: FeedItem[];
  source: "backend" | "fallback";
}> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/feeds/default`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as ApiFeedItemDTO[];
    const feeds: FeedItem[] = data.map((dto) => ({
      id: dto.feed_id,
      name: dto.feed_name,
      category: inferFeedCategory(dto.feed_name),
      bkPercent: dto.bk_percent,
      pkPercent: dto.pk_percent,
      tdnPercent: dto.tdn_percent,
      maxLimitKg: dto.max_limit_kg,
      pricePerKg: dto.price_per_kg,
      isActive: dto.is_active ?? true,
    }));
    return { feeds, source: "backend" };
  } catch {
    return {
      feeds: DEFAULT_LOCAL_FEEDS.map((item) => ({ ...item })),
      source: "fallback",
    };
  }
}

/**
 * POST /api/v1/ration/optimize
 * Menjalankan solver Linear Programming di backend Python; fallback ke Simplex Solver lokal
 */
export async function optimizeRation(params: {
  cattleId: string;
  currentWeightKg: number;
  targetWeightKg: number;
  daysToQurban: number;
  availableFeeds: FeedItem[];
  maxBiologicalAdgKg?: number;
  breedName?: string;
}): Promise<OptimizationResult> {
  const adgEstimate = Math.max(
    0,
    (params.targetWeightKg - params.currentWeightKg) /
      Math.max(1, params.daysToQurban)
  );
  const requirements = calculateNutrientRequirements(
    params.currentWeightKg,
    adgEstimate
  );

  try {
    const payload: ApiOptimizationRequestDTO = {
      cattle_id: params.cattleId,
      current_weight_kg: params.currentWeightKg,
      target_weight_kg: params.targetWeightKg,
      days_to_qurban: params.daysToQurban,
      available_feeds: params.availableFeeds.map((f) => ({
        feed_id: f.id,
        feed_name: f.name,
        bk_percent: f.bkPercent,
        pk_percent: f.pkPercent,
        tdn_percent: f.tdnPercent,
        max_limit_kg: f.maxLimitKg,
        price_per_kg: f.pricePerKg,
        is_active: f.isActive,
      })),
    };

    const res = await fetchWithTimeout(
      `${API_BASE_URL}/api/v1/ration/optimize`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const dto = (await res.json()) as ApiOptimizationResponseDTO;
    const maxBio = params.maxBiologicalAdgKg ?? 1.5;
    const feasibleByBreed = dto.adg_required_kg <= maxBio && dto.is_adg_feasible;
    return {
      status: dto.status,
      cattleId: dto.cattle_id,
      adgRequiredKg: dto.adg_required_kg,
      maxBiologicalAdgKg: maxBio,
      isAdgFeasible: feasibleByBreed,
      totalCostPerDayRp: dto.total_cost_per_day_rp,
      totalCostToQurbanRp: dto.total_cost_to_qurban_rp,
      totalBkProvidedKg: dto.total_bk_provided_kg,
      totalPkProvidedKg: dto.total_pk_provided_kg,
      totalTdnProvidedKg: dto.total_tdn_provided_kg,
      requirements,
      rationComposition: dto.ration_composition.map((item) => ({
        feedId: item.feed_id,
        feedName: item.feed_name,
        amountAsFedKg: item.amount_as_fed_kg,
        amountBkKg: item.amount_bk_kg,
        costRp: item.cost_rp,
      })),
      warningMessage: dto.warning_message || undefined,
      source: "backend",
    };
  } catch {
    return optimizeRationFallback(params);
  }
}

/**
 * POST /api/v1/health/screen
 * Mengevaluasi gejala klinis PMK & sinyal anomali pakan/bobot; fallback ke Rule Engine lokal
 */
export async function screenCattleHealth(
  input: HealthChecklistForm
): Promise<HealthStatus> {
  const localEval = evaluateHealthFallback(input);

  try {
    const payload: ApiHealthChecklistInputDTO = {
      cattle_id: input.cattleId,
      air_liur_berlebih: input.airLiurBerlebih,
      lepuh_mulut_kaki: input.lepuhMulutKaki,
      pincang: input.pincang,
      demam: input.demam,
      diare: input.diare,
      penurunan_pakan_percent: input.penurunanPakanPercent,
      penurunan_bobot_percent: input.penurunanBobotPercent,
    };

    const res = await fetchWithTimeout(`${API_BASE_URL}/api/v1/health/screen`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const dto = (await res.json()) as ApiHealthScreeningResponseDTO;
    return {
      cattleId: dto.cattle_id,
      totalScore: dto.total_score,
      riskLevel: dto.risk_level,
      riskBadgeColor: dto.risk_badge_color,
      summary: dto.summary,
      recommendedAction: dto.recommended_action,
      actionSteps: localEval.actionSteps,
      dietaryIntervention: localEval.dietaryIntervention,
      checkedAt: new Date().toISOString(),
      triggeredIndicators: localEval.triggeredIndicators,
      source: "backend",
    };
  } catch {
    return localEval;
  }
}

