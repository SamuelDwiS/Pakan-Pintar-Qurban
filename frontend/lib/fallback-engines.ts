import type {
  CattleProfile,
  DietaryInterventionRecommendation,
  FeedAdjustmentItem,
  FeedItem,
  GrowthTrajectoryPoint,
  HealthChecklistForm,
  HealthStatus,
  NutrientRequirement,
  OptimizationResult,
  RationCompositionItem,
} from "@/types";

/**
 * Menghitung sisa hari menuju tanggal Idul Adha dari tanggal referensi
 */
export function calculateDaysToQurban(
  targetDateStr: string,
  fromDate: Date = new Date()
): number {
  const target = new Date(`${targetDateStr}T00:00:00`);
  const startOfToday = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  );
  const diffMs = target.getTime() - startOfToday.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Estimasi Kebutuhan Nutrisi Harian Sapi Potong Mengacu Standar NASEM (2015) / NRC (2000)
 */
export function calculateNutrientRequirements(
  currentWeightKg: number,
  adgRequiredKg: number
): NutrientRequirement {
  const safeWeight = Math.max(100, currentWeightKg);
  const effectiveAdg = Math.max(0.2, Math.min(adgRequiredKg, 1.6));
  const metabolicWeight = Math.pow(safeWeight, 0.75);

  // Kebutuhan Bahan Kering (BK): ~2.5% BB + penyesuaian laju pertumbuhan
  const bkReqKg = Number(
    (safeWeight * 0.0245 + effectiveAdg * 0.65).toFixed(2)
  );

  // Kebutuhan TDN: Hidup pokok (Maintenance) + Pertambahan Bobot (Gain)
  const tdnMaintenance = 0.0365 * metabolicWeight;
  const tdnGain = effectiveAdg * (1.85 + 0.0025 * safeWeight);
  const tdnReqKg = Number(
    Math.min(bkReqKg * 0.74, tdnMaintenance + tdnGain).toFixed(2)
  );

  // Kebutuhan Protein Kasar (PK): Maintenance + Gain
  const pkMaintenance = 0.0038 * metabolicWeight;
  const pkGain = effectiveAdg * 0.34;
  const pkReqKg = Number((pkMaintenance + pkGain).toFixed(2));

  return {
    bkReqKg,
    pkReqKg,
    tdnReqKg,
  };
}

/**
 * Two-Phase Simplex Solver untuk masalah Linear Programming Ransum Biaya Minimum:
 * Minimize c^T x
 * Subject to:
 *   A_ge * x >= b_ge   (Kendala minimal BK, PK, TDN)
 *   0 <= x_j <= u_j    (Batas maksimal pemberian pakan per hari)
 */
function solveLeastCostLP(
  costs: number[],
  aGe: number[][],
  bGe: number[],
  upperBounds: number[]
): number[] | null {
  const n = costs.length;
  const mGe = bGe.length;
  // Ubah x_j <= u_j menjadi x_j + s_ub_j = u_j (mUb = n)
  // Ubah A_ge * x >= b_ge menjadi A_ge * x - surplus_i + artificial_i = b_ge
  const mUb = n;
  const totalRows = mGe + mUb;

  // Variabel:
  // 0 .. n-1                : x_j (pakan segar kg)
  // n .. n+mGe-1            : surplus_i (untuk >=)
  // n+mGe .. n+mGe+n-1      : slack_ub_j (untuk <= upperBound)
  // n+mGe+n .. n+2*mGe+n-1  : artificial_i (Phase 1)
  const numDecisionAndSlack = n + mGe + mUb;
  const totalCols = numDecisionAndSlack + mGe;

  // Tableau berukuran (totalRows + 1) x (totalCols + 1), kolom terakhir adalah RHS
  const tableau: number[][] = Array.from({ length: totalRows + 1 }, () =>
    Array(totalCols + 1).fill(0)
  );
  const basis: number[] = Array(totalRows).fill(-1);

  // Isi baris kendala >= (BK, PK, TDN)
  for (let i = 0; i < mGe; i++) {
    for (let j = 0; j < n; j++) {
      tableau[i][j] = aGe[i][j];
    }
    tableau[i][n + i] = -1; // surplus
    const artCol = numDecisionAndSlack + i;
    tableau[i][artCol] = 1; // artificial
    tableau[i][totalCols] = Math.max(0, bGe[i]);
    basis[i] = artCol;
  }

  // Isi baris kendala batas maksimum x_j <= upperBounds[j]
  for (let j = 0; j < mUb; j++) {
    const row = mGe + j;
    tableau[row][j] = 1;
    const slackCol = n + mGe + j;
    tableau[row][slackCol] = 1;
    tableau[row][totalCols] = Math.max(0, upperBounds[j]);
    basis[row] = slackCol;
  }

  const EPS = 1e-8;

  const pivot = (pivotRow: number, pivotCol: number) => {
    const pivVal = tableau[pivotRow][pivotCol];
    for (let c = 0; c <= totalCols; c++) {
      tableau[pivotRow][c] /= pivVal;
    }
    for (let r = 0; r <= totalRows; r++) {
      if (r !== pivotRow) {
        const factor = tableau[r][pivotCol];
        if (Math.abs(factor) > 1e-12) {
          for (let c = 0; c <= totalCols; c++) {
            tableau[r][c] -= factor * tableau[pivotRow][c];
          }
        }
      }
    }
    basis[pivotRow] = pivotCol;
  };

  const runSimplex = (maxCol: number): boolean => {
    let iter = 0;
    const maxIter = 500;
    while (iter < maxIter) {
      iter++;
      // Pilih kolom masuk (reduced cost paling negatif untuk minimisasi)
      let enteringCol = -1;
      let minVal = -EPS;
      for (let c = 0; c < maxCol; c++) {
        if (tableau[totalRows][c] < minVal) {
          minVal = tableau[totalRows][c];
          enteringCol = c;
        }
      }
      if (enteringCol === -1) {
        return true; // Optimal
      }

      // Minimum ratio test
      let leavingRow = -1;
      let minRatio = Infinity;
      for (let r = 0; r < totalRows; r++) {
        const aVal = tableau[r][enteringCol];
        if (aVal > EPS) {
          const ratio = tableau[r][totalCols] / aVal;
          if (ratio < minRatio - 1e-11) {
            minRatio = ratio;
            leavingRow = r;
          }
        }
      }

      if (leavingRow === -1) {
        return false; // Unbounded
      }
      pivot(leavingRow, enteringCol);
    }
    return false;
  };

  // ================= PHASE 1: Minimalkan jumlah variabel artifisial =================
  for (let c = 0; c <= totalCols; c++) {
    tableau[totalRows][c] = 0;
  }
  for (let i = 0; i < mGe; i++) {
    tableau[totalRows][numDecisionAndSlack + i] = 1;
  }
  // Eliminasi variabel artifisial dari baris objektif Phase 1
  for (let i = 0; i < mGe; i++) {
    for (let c = 0; c <= totalCols; c++) {
      tableau[totalRows][c] -= tableau[i][c];
    }
  }

  const phase1Ok = runSimplex(totalCols);
  if (!phase1Ok || Math.abs(tableau[totalRows][totalCols]) > 1e-4) {
    return null; // Infeasible (kombinasi pakan tidak sanggup memenuhi kebutuhan nutrisi)
  }

  // Keluarkan variabel artifisial yang masih di basis jika bernilai 0
  for (let r = 0; r < totalRows; r++) {
    if (basis[r] >= numDecisionAndSlack) {
      for (let c = 0; c < numDecisionAndSlack; c++) {
        if (Math.abs(tableau[r][c]) > EPS) {
          pivot(r, c);
          break;
        }
      }
    }
  }

  // ================= PHASE 2: Minimalkan total biaya pakan =================
  for (let c = 0; c <= totalCols; c++) {
    tableau[totalRows][c] = 0;
  }
  for (let j = 0; j < n; j++) {
    tableau[totalRows][j] = costs[j];
  }

  // Nolkan reduced cost pada variabel basis
  for (let r = 0; r < totalRows; r++) {
    const bCol = basis[r];
    if (bCol >= 0 && bCol < numDecisionAndSlack) {
      const factor = tableau[totalRows][bCol];
      if (Math.abs(factor) > 1e-12) {
        for (let c = 0; c < numDecisionAndSlack; c++) {
          tableau[totalRows][c] -= factor * tableau[r][c];
        }
        tableau[totalRows][totalCols] -= factor * tableau[r][totalCols];
      }
    }
  }

  const phase2Ok = runSimplex(numDecisionAndSlack);
  if (!phase2Ok) return null;

  const solution = Array(n).fill(0);
  for (let r = 0; r < totalRows; r++) {
    const bCol = basis[r];
    if (bCol >= 0 && bCol < n) {
      solution[bCol] = Math.max(0, tableau[r][totalCols]);
    }
  }
  return solution;
}

/**
 * Fallback Engine Modul 1 & 2: Optimasi Ransum & Validasi PBBH
 */
export function optimizeRationFallback(params: {
  cattleId: string;
  currentWeightKg: number;
  targetWeightKg: number;
  daysToQurban: number;
  availableFeeds: FeedItem[];
  maxBiologicalAdgKg?: number;
  breedName?: string;
}): OptimizationResult {
  const {
    cattleId,
    currentWeightKg,
    targetWeightKg,
    daysToQurban,
    availableFeeds,
    maxBiologicalAdgKg = 1.5,
    breedName,
  } = params;

  const safeDays = Math.max(1, daysToQurban);
  const weightDiff = Math.max(0, targetWeightKg - currentWeightKg);
  const adgRequiredKg = Number((weightDiff / safeDays).toFixed(2));
  const isAdgFeasible = adgRequiredKg <= maxBiologicalAdgKg;

  const warnings: string[] = [];
  if (!isAdgFeasible) {
    warnings.push(
      `Target PBBH (${adgRequiredKg} kg/hari) melebihi batas biologis normal${
        breedName ? ` bangsa ${breedName}` : ""
      } (~${maxBiologicalAdgKg} kg/hari). Disarankan menyesuaikan target bobot atau memperpanjang masa penggemukan.`
    );
  }

  const activeFeeds = availableFeeds.filter(
    (f) => f.isActive && f.maxLimitKg > 0
  );
  const requirements = calculateNutrientRequirements(
    currentWeightKg,
    adgRequiredKg
  );

  if (activeFeeds.length === 0) {
    return {
      status: "infeasible",
      cattleId,
      adgRequiredKg,
      isAdgFeasible,
      totalCostPerDayRp: 0,
      totalCostToQurbanRp: 0,
      totalBkProvidedKg: 0,
      totalPkProvidedKg: 0,
      totalTdnProvidedKg: 0,
      requirements,
      rationComposition: [],
      warningMessage:
        "Pilih minimal satu bahan pakan aktif (hijauan & konsentrat) untuk menyusun ransum.",
      source: "fallback",
    };
  }

  const costs = activeFeeds.map((f) => f.pricePerKg);
  const bkCoeffs = activeFeeds.map((f) => f.bkPercent / 100);
  const pkCoeffs = activeFeeds.map(
    (f) => (f.bkPercent / 100) * (f.pkPercent / 100)
  );
  const tdnCoeffs = activeFeeds.map(
    (f) => (f.bkPercent / 100) * (f.tdnPercent / 100)
  );

  // Takaran dasar wajib dari hasil wawancara peternak lapangan:
  // Bran Pollard: 0.25 kg (1/4 kg)
  // NutriFeed: 1.25 kg (1 1/4 kg)
  // Ampas Tahu: 1.50 kg (1 1/2 kg)
  // Katul: 0.50 kg (1/2 kg)
  // Rumput Segar: minimal 10.0 kg
  const lowerBounds = activeFeeds.map((f) => {
    const nl = f.name.toLowerCase();
    if (nl.includes("polar") || nl.includes("pollard")) return Math.min(f.maxLimitKg, 0.25);
    if (
      nl.includes("nutrifeed") ||
      (nl.includes("konsentrat") &&
        !nl.includes("ampas") &&
        !nl.includes("polar") &&
        !nl.includes("katul"))
    ) {
      return Math.min(f.maxLimitKg, 1.25);
    }
    if (nl.includes("ampas")) return Math.min(f.maxLimitKg, 1.50);
    if (nl.includes("katul") || nl.includes("bekatul") || nl.includes("dedak")) {
      return Math.min(f.maxLimitKg, 0.50);
    }
    if (nl.includes("rumput")) return Math.min(f.maxLimitKg, 10.0);
    return 0.0;
  });

  // Hitung nutrisi yang telah disuplai oleh batas bawah takaran wawancara
  let bkFromLower = 0;
  let pkFromLower = 0;
  let tdnFromLower = 0;
  lowerBounds.forEach((l, idx) => {
    bkFromLower += l * (activeFeeds[idx].bkPercent / 100);
    pkFromLower +=
      l * (activeFeeds[idx].bkPercent / 100) * (activeFeeds[idx].pkPercent / 100);
    tdnFromLower +=
      l * (activeFeeds[idx].bkPercent / 100) * (activeFeeds[idx].tdnPercent / 100);
  });

  const remainingBk = Math.max(0, requirements.bkReqKg - bkFromLower);
  const remainingPk = Math.max(0, requirements.pkReqKg - pkFromLower);
  const remainingTdn = Math.max(0, requirements.tdnReqKg - tdnFromLower);

  // Resep 4 konsentrat dikunci pada takaran tetap hasil wawancara peternak lapangan:
  // Bran Pollard: 0.25 kg, NutriFeed: 1.25 kg, Ampas Tahu: 1.50 kg, Katul: 0.50 kg.
  // reducedUpperBounds untuk keempat konsentrat bernilai 0 agar solver Least-Cost
  // tidak melebihkan porsi konsentrat di atas takaran peternak, melainkan mengoptimalkan
  // porsi hijauan serat (Rumput Segar & Dami) untuk menutup sisa kebutuhan nutrisi sapi.
  const reducedUpperBounds = activeFeeds.map((f, idx) => {
    const nl = f.name.toLowerCase();
    const isFixedConcentrate =
      nl.includes("polar") ||
      nl.includes("pollard") ||
      nl.includes("nutrifeed") ||
      nl.includes("ampas") ||
      nl.includes("katul") ||
      nl.includes("bekatul") ||
      nl.includes("dedak");

    if (isFixedConcentrate) {
      return 0.0;
    }
    return Math.max(0, f.maxLimitKg - lowerBounds[idx]);
  });

  const solutionDelta = solveLeastCostLP(
    costs,
    [bkCoeffs, pkCoeffs, tdnCoeffs],
    [remainingBk, remainingPk, remainingTdn],
    reducedUpperBounds
  );

  let solution: number[];
  if (solutionDelta) {
    solution = activeFeeds.map((_, idx) => lowerBounds[idx] + solutionDelta[idx]);
  } else {
    // Jika sisa kebutuhan tidak konvergen, tambahkan rumput segar untuk menutup kekurangan BK
    solution = [...lowerBounds];
    const grassIdx = activeFeeds.findIndex((f) =>
      f.name.toLowerCase().includes("rumput")
    );
    if (grassIdx >= 0) {
      const grassBkFrac = activeFeeds[grassIdx].bkPercent / 100;
      const extraGrass = Math.min(
        reducedUpperBounds[grassIdx],
        Math.max(0, remainingBk / grassBkFrac)
      );
      solution[grassIdx] += extraGrass;
    }
  }

  const rationComposition: RationCompositionItem[] = [];
  let totalCostPerDayRp = 0;
  let totalBkProvidedKg = 0;
  let totalPkProvidedKg = 0;
  let totalTdnProvidedKg = 0;

  activeFeeds.forEach((feed, idx) => {
    const amountAsFed = solution[idx];
    if (amountAsFed > 0.01) {
      const amountBk = amountAsFed * (feed.bkPercent / 100);
      const amountPk = amountBk * (feed.pkPercent / 100);
      const amountTdn = amountBk * (feed.tdnPercent / 100);
      const costRp = amountAsFed * feed.pricePerKg;

      totalCostPerDayRp += costRp;
      totalBkProvidedKg += amountBk;
      totalPkProvidedKg += amountPk;
      totalTdnProvidedKg += amountTdn;

      rationComposition.push({
        feedId: feed.id,
        feedName: feed.name,
        amountAsFedKg: Number(amountAsFed.toFixed(2)),
        amountBkKg: Number(amountBk.toFixed(2)),
        costRp: Math.round(costRp),
      });
    }
  });

  // Urutkan dari takaran pakan segar terbesar ke terkecil
  rationComposition.sort((a, b) => b.amountAsFedKg - a.amountAsFedKg);

  return {
    status: "optimal",
    cattleId,
    adgRequiredKg,
    maxBiologicalAdgKg,
    isAdgFeasible,
    totalCostPerDayRp: Math.round(totalCostPerDayRp),
    totalCostToQurbanRp: Math.round(totalCostPerDayRp * safeDays),
    totalBkProvidedKg: Number(totalBkProvidedKg.toFixed(2)),
    totalPkProvidedKg: Number(totalPkProvidedKg.toFixed(2)),
    totalTdnProvidedKg: Number(totalTdnProvidedKg.toFixed(2)),
    requirements,
    rationComposition,
    warningMessage: warnings.length > 0 ? warnings.join(" ") : undefined,
    source: "fallback",
  };
}

/**
 * Modul 2: Adaptive Ridge Regression untuk Proyeksi Kurva Pertumbuhan Sapi
 */
export function buildGrowthTrajectory(profile: CattleProfile): {
  points: GrowthTrajectoryPoint[];
  observedAdgKg: number;
  projectedFinalWeightKg: number;
} {
  const sortedLogs = [...profile.weightLogs].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const startStr = sortedLogs[0]?.date || profile.startDate;
  const startMs = new Date(`${startStr}T00:00:00`).getTime();
  const targetMs = new Date(`${profile.targetDateQurban}T00:00:00`).getTime();
  const totalSpanDays = Math.max(
    14,
    Math.round((targetMs - startMs) / (1000 * 60 * 60 * 24))
  );

  const initialW = sortedLogs[0]?.weightKg ?? profile.initialWeightKg;
  const idealSlope = (profile.targetWeightKg - initialW) / totalSpanDays;

  // Ridge Regression 1D pada selisih hari (t) vs kenaikan bobot (w - w0)
  // Memadukan prior biologis NRC (alpha regularization) dengan data penimbangan aktual
  let sumT2 = 0;
  let sumTY = 0;
  sortedLogs.forEach((log) => {
    const t = Math.max(
      0,
      Math.round(
        (new Date(`${log.date}T00:00:00`).getTime() - startMs) /
          (1000 * 60 * 60 * 24)
      )
    );
    const y = log.weightKg - initialW;
    sumT2 += t * t;
    sumTY += t * y;
  });

  const ridgeLambda = 250; // Regularisasi agar kurva stabil saat log masih sedikit
  const priorSlope = Math.min(1.25, Math.max(0.55, idealSlope));
  const adaptiveSlope =
    sortedLogs.length >= 2
      ? (sumTY + ridgeLambda * priorSlope) / (sumT2 + ridgeLambda)
      : priorSlope;

  const latestLog = sortedLogs[sortedLogs.length - 1];
  const latestDay = latestLog
    ? Math.max(
        0,
        Math.round(
          (new Date(`${latestLog.date}T00:00:00`).getTime() - startMs) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;
  const latestWeight = latestLog ? latestLog.weightKg : profile.currentWeightKg;

  // Bangun titik grafik gabungan: seluruh titik log aktual + milestone menuju Idul Adha
  const milestoneDays = new Set<number>([0, totalSpanDays]);
  const stepCount = 6;
  for (let i = 1; i < stepCount; i++) {
    milestoneDays.add(Math.round((totalSpanDays * i) / stepCount));
  }

  const logByDay = new Map<number, number>();
  sortedLogs.forEach((log) => {
    const d = Math.max(
      0,
      Math.round(
        (new Date(`${log.date}T00:00:00`).getTime() - startMs) /
          (1000 * 60 * 60 * 24)
      )
    );
    milestoneDays.add(d);
    logByDay.set(d, log.weightKg);
  });

  const sortedDays = Array.from(milestoneDays)
    .filter((d) => d >= 0 && d <= totalSpanDays)
    .sort((a, b) => a - b);

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  });

  const points: GrowthTrajectoryPoint[] = sortedDays.map((dayIdx) => {
    const pointDate = new Date(startMs + dayIdx * 24 * 60 * 60 * 1000);
    const isoDate = pointDate.toISOString().slice(0, 10);
    const idealWeightKg = Number((initialW + idealSlope * dayIdx).toFixed(1));
    const actual = logByDay.has(dayIdx) ? logByDay.get(dayIdx)! : null;

    const predictedWeightKg =
      dayIdx <= latestDay
        ? Number((initialW + adaptiveSlope * dayIdx).toFixed(1))
        : Number(
            (latestWeight + adaptiveSlope * (dayIdx - latestDay)).toFixed(1)
          );

    return {
      label:
        dayIdx === totalSpanDays
          ? `Idul Adha (${formatter.format(pointDate)})`
          : formatter.format(pointDate),
      date: isoDate,
      dayIndex: dayIdx,
      idealWeightKg,
      actualWeightKg: actual,
      predictedWeightKg,
    };
  });

  const projectedFinalWeightKg = Number(
    (latestWeight + adaptiveSlope * Math.max(0, totalSpanDays - latestDay)).toFixed(1)
  );

  return {
    points,
    observedAdgKg: Number(adaptiveSlope.toFixed(2)),
    projectedFinalWeightKg,
  };
}

/**
 * Fallback Engine Modul 3: Sistem Pakar Skrining Dini PMK (KIAT VETINDO PMK Kementan RI)
 */
/**
 * Mesin Intervensi Pakan Pintar AI (Closed-Loop Nutrition & Health Feedback)
 * Menyesuaikan formula pakan lokal berdasarkan kondisi klinis yang terdeteksi
 */
export function generateDietaryIntervention(
  input: HealthChecklistForm,
  riskLevel: "HIJAU" | "KUNING" | "MERAH"
): DietaryInterventionRecommendation | undefined {
  // 1. Kasus Sariawan / Lepuh Mulut atau Air Liur Menggantung Kritis
  if (input.lepuhMulutKaki || (input.airLiurBerlebih && riskLevel === "MERAH")) {
    return {
      headline: "Proteksi Rongga Mulut & Komboran Lunak",
      clinicalReason:
        "Rongga mulut dan lidah sapi mengalami lesi/sariawan nyeri. Serat kasar yang tajam akan melukai gusi.",
      feedAdjustments: [
        {
          feedName: "Dami (Jerami Padi)",
          adjustmentType: "HINDARI_SEMENTARA",
          note: "Hentikan sementara jerami kering berujung kaku agar tidak menusuk luka lepuh mulut.",
        },
        {
          feedName: "Katul",
          adjustmentType: "UTAMAKAN",
          suggestedDeltaKg: 0.5,
          note: "Gunakan dedak/katul halus yang diseduh air hangat menjadi bubur komboran lembut.",
        },
        {
          feedName: "Ampas Tahu",
          adjustmentType: "UTAMAKAN",
          suggestedDeltaKg: 1.0,
          note: "Ampas tahu bertekstur empuk basah, tinggi protein, dan mudah ditelan tanpa perlu dikunyah keras.",
        },
      ],
      practicalTips: [
        "Sajikan pakan dalam bentuk komboran bubur suam-suam kuku langsung di depan moncong sapi.",
        "Bilas moncong sapi dengan air garam hangat atau rebusan daun sirih secara lembut.",
        "Potong rumput segar menjadi cacahan sangat pendek (< 3 cm) agar mudah dikunyah.",
      ],
      suggestedRationOverride: {
        maxDamiKg: 0,
        maxAmpasTahuKg: 6,
      },
    };
  }

  // 2. Kasus Diare / Kotoran Cair
  if (input.diare) {
    return {
      headline: "Stabilisasi Rumen & Pemadatan Feses",
      clinicalReason:
        "Kotoran encer menandakan gangguan pencernaan atau kelebihan asam/kadar air tinggi pada mikrobiota rumen.",
      feedAdjustments: [
        {
          feedName: "Ampas Tahu",
          adjustmentType: "KURANGI",
          suggestedDeltaKg: -1.5,
          note: "Kurangi pakan basah berkadar air tinggi yang cepat terfermentasi menjadi asam.",
        },
        {
          feedName: "Dami (Jerami Padi)",
          adjustmentType: "TAMBAH",
          suggestedDeltaKg: 1.0,
          note: "Perbanyak jerami kering bersih untuk merangsang pengunyahan kembali (ruminasi) dan memadatkan feses.",
        },
        {
          feedName: "Katul",
          adjustmentType: "UTAMAKAN",
          note: "Pertahankan dedak/katul kering sebagai bahan pengikat cairan di saluran cerna.",
        },
      ],
      practicalTips: [
        "Berikan air minum bersih dicampur 1 sendok garam dapur dan sedikit gula merah untuk mencegah dehidrasi.",
        "Jangan berikan rumput basah yang baru dipotong saat hujan.",
      ],
      suggestedRationOverride: {
        maxAmpasTahuKg: 2,
      },
    };
  }

  // 3. Kasus Penurunan Nafsu Makan (> 10%)
  if (input.penurunanPakanPercent > 10 || input.airLiurBerlebih) {
    return {
      headline: "Intervensi Palatabilitas & Perangsang Nafsu Makan",
      clinicalReason: `Nafsu makan terpantau turun ${input.penurunanPakanPercent}%. Sapi membutuhkan pakan beraroma wangi yang menggugah selera.`,
      feedAdjustments: [
        {
          feedName: "Bran Polar",
          adjustmentType: "TAMBAH",
          suggestedDeltaKg: 0.5,
          note: "Tambahkan porsi polar karena aroma manis gandumnya sangat disukai sapi (palatabilitas tinggi).",
        },
        {
          feedName: "Dami (Jerami Padi)",
          adjustmentType: "KURANGI",
          suggestedDeltaKg: -1.0,
          note: "Kurangi dami hambar yang membuat sapi semakin malas mengunyah saat kondisi lesu.",
        },
      ],
      practicalTips: [
        "Percikkan air larutan garam dapur hangat atau sedikit tetes tebu (molases) di atas tumpukan pakan.",
        "Bagi jadwal pemberian pakan menjadi porsi kecil tetapi lebih sering (3x sehari: pagi, siang, sore).",
        "Bersihkan palungan dari sisa pakan masam sebelum menuangkan adukan baru.",
      ],
      suggestedRationOverride: {
        minPolarKg: 1.0,
      },
    };
  }

  // 4. Kasus Bobot Badan Turun (> 2% per minggu)
  if (input.penurunanBobotPercent > 2) {
    return {
      headline: "Peningkatan Densitas Energi & Kompensasi Bobot Kurban",
      clinicalReason: `Terjadi penyusutan bobot nyata ${input.penurunanBobotPercent}%. Dibutuhkan densitas kalori lebih padat untuk mengejar target kurban.`,
      feedAdjustments: [
        {
          feedName: "Nutrifeed (Konsentrat)",
          adjustmentType: "TAMBAH",
          suggestedDeltaKg: 0.5,
          note: "Tingkatkan konsentrat energi TDN tinggi untuk memacu percepatan laju PBBH harian.",
        },
        {
          feedName: "Ampas Tahu",
          adjustmentType: "TAMBAH",
          suggestedDeltaKg: 1.0,
          note: "Dongkrak asupan protein kasar (PK) mudah serap untuk pembentukan massa otot/daging.",
        },
      ],
      practicalTips: [
        "Berikan konsentrat padat sebelum hijauan agar energi terserap maksimal oleh rumen.",
        "Lakukan penimbangan ulang dalam 7 hari ke depan untuk mengevaluasi kurva pertumbuhan kompensasi.",
      ],
      suggestedRationOverride: {
        boostNutrifeedKg: 0.5,
      },
    };
  }

  return undefined;
}

export function evaluateHealthFallback(
  input: HealthChecklistForm
): HealthStatus {
  let score = 0;
  const triggered: string[] = [];

  if (input.airLiurBerlebih) {
    score += 30;
    triggered.push("Air liur berlebih / menggantung (+30)");
  }
  if (input.lepuhMulutKaki) {
    score += 40;
    triggered.push("Lepuh pada mulut / lidah / gusi / kaki (+40)");
  }
  if (input.pincang) {
    score += 20;
    triggered.push("Pincang / tumpuan kaki lemah (+20)");
  }
  if (input.demam) {
    score += 15;
    triggered.push("Demam tinggi / tubuh panas (+15)");
  }
  if (input.diare) {
    score += 10;
    triggered.push("Diare / kotoran cair (+10)");
  }
  if (input.penurunanPakanPercent > 20) {
    score += 25;
    triggered.push(
      `Konsumsi pakan turun ${input.penurunanPakanPercent}% (>20% dalam 2 hari) (+25)`
    );
  }
  if (input.penurunanBobotPercent > 2) {
    score += 20;
    triggered.push(
      `Bobot badan turun ${input.penurunanBobotPercent}% (>2% seminggu) (+20)`
    );
  }

  const riskLevel = score >= 40 ? "MERAH" : score >= 20 ? "KUNING" : "HIJAU";
  const dietaryIntervention = generateDietaryIntervention(input, riskLevel);

  if (riskLevel === "MERAH") {
    return {
      cattleId: input.cattleId,
      totalScore: score,
      riskLevel: "MERAH",
      riskBadgeColor: "red",
      summary:
        "BAHAYA / INDIKASI PMK! Terdeteksi gejala klinis utama (lepuh/air liur) atau kombinasi anomali risiko tinggi.",
      recommendedAction:
        "Lakukan tindakan karantina darurat sekarang juga dan segera panggil mantri langganan Anda!",
      actionSteps: [
        "Pindahkan sapi ke Kandang Isolasi / sekat paling ujung terpisah dari kelompok.",
        "STOP mutasi: Jangan memindahkan atau menjual sapi keluar kandang untuk mencegah wabah.",
        "Semprot kandang, sekat, dan lantai dengan disinfektan (larutan kaporit atau asam sitrat/citric acid).",
        "Cuci luka lepuh di mulut & sela kuku dengan air hangat bersih untuk meredakan nyeri.",
        "Segera hubungi mantri hewan langganan Anda untuk pemeriksaan medis dan suntikan obat/vitamin.",
      ],
      dietaryIntervention,
      checkedAt: new Date().toISOString(),
      triggeredIndicators: triggered,
      catatanTambahan: input.catatanTambahan,
      source: "fallback",
    };
  }

  if (riskLevel === "KUNING") {
    return {
      cattleId: input.cattleId,
      totalScore: score,
      riskLevel: "KUNING",
      riskBadgeColor: "yellow",
      summary:
        "WASPADA! Terdeteksi anomali nafsu makan/bobot atau gejala klinis ringan.",
      recommendedAction:
        "Lakukan penanganan mandiri awal: pisahkan palungan dan berikan minuman pemulih cairan.",
      actionSteps: [
        "Pisahkan tempat makan & minum agar tidak tertular ke sapi lain di kandang.",
        "Beri minuman hangat dicampur sedikit garam dapur, gula merah, atau molases untuk stamina.",
        "Berikan rumput segar yang agak layu; kurangi porsi ampas tahu basah atau konsentrat jika ada diare.",
        "Amati suhu tubuh & nafsu makan selama 1x24 jam. Jika besok belum pulih, panggil mantri hewan langganan Anda.",
      ],
      dietaryIntervention,
      checkedAt: new Date().toISOString(),
      triggeredIndicators: triggered,
      catatanTambahan: input.catatanTambahan,
      source: "fallback",
    };
  }

  return {
    cattleId: input.cattleId,
    totalScore: score,
    riskLevel: "HIJAU",
    riskBadgeColor: "green",
    summary: "SEHAT & NORMAL. Tidak ditemukan indikasi klinis penyakit maupun mogok makan.",
    recommendedAction:
      "Pertahankan manajemen pakan pokok (rumput & dami) serta adukan konsentrat harian.",
    actionSteps: [
      "Beri pakan segar & adukan konsentrat sesuai porsi hari ini (bagi 2x: pagi & sore).",
      "Pastikan ketersediaan air minum bersih selalu penuh di bak/ember (ad libitum).",
      "Bersihkan sisa pakan yang mulai masam di palungan setiap pagi.",
      "Lakukan penimbangan berkala 1–2 minggu sekali untuk memantau target kurban.",
    ],
    dietaryIntervention,
    checkedAt: new Date().toISOString(),
    triggeredIndicators: triggered,
    catatanTambahan: input.catatanTambahan,
    source: "fallback",
  };
}

