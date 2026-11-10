import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import type {
  AiIngredientMixItem,
  AiRationRecommendation,
  FeedItem,
  OptimizationResult,
} from "@/types";

export const runtime = "nodejs";

interface RequestPayload {
  cattle: {
    name: string;
    breed: string;
    currentWeightKg: number;
    targetWeightKg: number;
    daysToQurban: number;
    targetDateQurban?: string;
  };
  feeds: FeedItem[];
  optimizationResult?: OptimizationResult | null;
}

interface GeminiRationResponse {
  pbbhEvaluation: string;
  feedStrategy: string;
  adaptationNote: string;
  recommendedMix: {
    name: string;
    amountKg: number;
    nutritionalRole: string;
  }[];
  managementAdvice: string[];
  warnings: string[];
}

// Skema JSON untuk Structured Output Gemini
const rationResponseSchema = {
  type: "object",
  properties: {
    pbbhEvaluation: {
      type: "string",
      description: "Evaluasi target pertumbuhan bobot sapi berdasarkan ketersediaan stok ransum.",
    },
    feedStrategy: {
      type: "string",
      description: "Strategi pemberian pakan (jadwal komboran, hijauan segar, dan air minum).",
    },
    adaptationNote: {
      type: "string",
      description: "Catatan adaptasi pakan baru bagi mikroba rumen sapi.",
    },
    recommendedMix: {
      type: "array",
      description: "Daftar komposisi bahan pakan harian dari stok yang tersedia.",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nama bahan sesuai data stok input.",
          },
          amountKg: {
            type: "number",
            description: "Jumlah takaran pakan dalam kg per hari (tidak melebihi stok).",
          },
          nutritionalRole: {
            type: "string",
            description: "Peran nutrisi bahan dalam formulasi ransum komplit.",
          },
        },
        required: ["name", "amountKg", "nutritionalRole"],
      },
    },
    managementAdvice: {
      type: "array",
      items: {
        type: "string",
      },
    },
    warnings: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [
    "pbbhEvaluation",
    "feedStrategy",
    "adaptationNote",
    "recommendedMix",
    "managementAdvice",
    "warnings",
  ],
};

const systemInstruction = `
Anda adalah asisten AI spesialis Formulasi Nutrisi Sapi Potong Penggemukan Qurban (Ruminant Nutritionist).

PRINSIP UTAMA HASIL WAWANCARA LAPANGAN PETERNAK SAPI:
1. Pertumbuhan rata-rata harian sapi (PBBH/ADG) peternak berada pada kisaran 1.0 kg/hari.
2. Peternak menggunakan racikan komboran 4 pakan konsentrat dengan takaran harian riil per ekor sapi:
   - Bran Pollard: 1/4 kg (0.25 kg)
   - NutriFeed: 1 1/4 kg (1.25 kg)
   - Ampas Tahu Basah: 1 1/2 kg (1.50 kg)
   - Katul / Bekatul: 1/2 kg (0.50 kg)
   Total konsentrat komboran = 3.50 kg/ekor/hari.

ATURAN WAJIB FORMULASI TABEL RANSUM:
1. KEEMPAT KOMPONEN KONSENTRAT DI ATAS WAJIB DIGUNAKAN SEMUANYA PADA TABEL TAKARAN RANSUM. TIDAK BOLEH ADA YANG TIDAK DIGUNAKAN ATAU 0 KG.
   - Bran Pollard: 0.25 kg (Pagi: 0.125 kg, Sore: 0.125 kg)
   - NutriFeed: 1.25 kg (Pagi: 0.625 kg, Sore: 0.625 kg)
   - Ampas Tahu Basah: 1.50 kg (Pagi: 0.75 kg, Sore: 0.75 kg)
   - Katul: 0.50 kg (Pagi: 0.25 kg, Sore: 0.25 kg)

2. PADUKAN DENGAN HIJAUAN & SERAT KASAR:
   - Rumput Segar (15 - 30 kg sesuai bobot badan) dan Dami Padi (1 - 2 kg jika aktif) wajib disajikan untuk motilitas rumen, produksi saliva buffer, dan mencegah asidosis.

3. KEPATUHAN KETAT TERHADAP BATAS STOK:
   - Jumlah takaran pakan harian ('amountKg') untuk setiap bahan TIDAK BOLEH MELEBIHI stok yang tersedia ('stokTersediaKgPerHari').

4. PERAN NUTRISI SETIAP BAHAN:
   - Di dalam 'nutritionalRole', jelaskan fungsi spesifik masing-masing bahan pakan (misal: Bran Pollard pemacu nafsu makan & aroma gurih, NutriFeed konsentrat padat pembentuk karkas, Ampas Tahu sumber protein basah, Katul karbohidrat energi fermentasi, Rumput Segar serat utama rumen).

Berikan jawaban dalam bahasa Indonesia dan dalam format JSON yang valid.
`;

function buildExpertSystemFallback(
  cattle: RequestPayload["cattle"],
  activeFeeds: FeedItem[],
  targetPbbh: number,
  modelName: string
): AiRationRecommendation {
  const currentW = cattle.currentWeightKg;
  const safeDays = Math.max(1, cattle.daysToQurban);

  const recommendedMix: AiIngredientMixItem[] = [];
  let totalDailyCost = 0;

  // Alokasi Hijauan / Serat Kasar
  const roughages = activeFeeds.filter(
    (f) => f.category === "Hijauan" || f.category === "Limbah Pertanian"
  );
  if (roughages.length > 0) {
    roughages.forEach((feed) => {
      const isFreshGrass = feed.name.toLowerCase().includes("rumput");
      // Rumput segar 20-30 kg, Dami 1.5-2.5 kg
      const targetKg = isFreshGrass
        ? Math.min(feed.maxLimitKg, Math.max(12, currentW * 0.07))
        : Math.min(feed.maxLimitKg, 1.5);

      if (targetKg > 0.05) {
        const amountKg = Number(targetKg.toFixed(2));
        const costRp = Math.round(amountKg * feed.pricePerKg);
        totalDailyCost += costRp;
        recommendedMix.push({
          name: feed.name,
          amountKg,
          morningKg: Number((amountKg * 0.4).toFixed(2)),
          afternoonKg: Number((amountKg * 0.6).toFixed(2)),
          costRp,
          nutritionalRole: isFreshGrass
            ? "Sumber serat hijauan segar mutlak untuk memelihara mikroba rumen dan saliva buffer."
            : "Sumber serat kasar kering untuk merangsang aktivitas pengunyahan (ruminasi).",
        });
      }
    });
  }

  // Alokasi 4 Konsentrat Wajib Sesuai Wawancara Lapangan:
  // Bran Pollard: 1/4 kg (0.25 kg)
  // NutriFeed: 1 1/4 kg (1.25 kg)
  // Ampas Tahu: 1 1/2 kg (1.50 kg)
  // Katul: 1/2 kg (0.50 kg)
  const concentrates = activeFeeds.filter(
    (f) => f.category === "Konsentrat"
  );

  concentrates.forEach((feed) => {
    const nameLower = feed.name.toLowerCase();
    let targetKg = 0.5;
    let role = "Sumber nutrisi konsentrat pelengkap energi dan protein.";

    if (nameLower.includes("polar") || nameLower.includes("pollard")) {
      targetKg = Math.min(feed.maxLimitKg, 0.25); // 1/4 kg
      role = "Meningkatkan palatabilitas (aroma gurih & nafsu makan sapi) serta sumber serat mudah cerna (1/4 kg).";
    } else if (nameLower.includes("nutrifeed") || nameLower.includes("konsentrat")) {
      targetKg = Math.min(feed.maxLimitKg, 1.25); // 1 1/4 kg
      role = "Konsentrat padat nutrisi terfortifikasi mineral & protein pembentuk karkas kurban (1 1/4 kg).";
    } else if (nameLower.includes("ampas")) {
      targetKg = Math.min(feed.maxLimitKg, 1.50); // 1 1/2 kg
      role = "Sumber protein basah empuk pemacu sintesis asam amino dan pembesaran otot daging (1 1/2 kg).";
    } else if (nameLower.includes("katul") || nameLower.includes("bekatul") || nameLower.includes("dedak")) {
      targetKg = Math.min(feed.maxLimitKg, 0.50); // 1/2 kg
      role = "Sumber karbohidrat fermentabel rumen & energi murah perangsang mikroba rumen (1/2 kg).";
    } else {
      targetKg = Math.min(feed.maxLimitKg, 1.0);
    }

    const amountKg = Number(targetKg.toFixed(2));
    const costRp = Math.round(amountKg * feed.pricePerKg);
    totalDailyCost += costRp;

    recommendedMix.push({
      name: feed.name,
      amountKg,
      morningKg: Number((amountKg / 2).toFixed(2)),
      afternoonKg: Number((amountKg / 2).toFixed(2)),
      costRp,
      nutritionalRole: role,
    });
  });

  // Urutkan dari takaran pakan segar terbanyak ke paling sedikit
  recommendedMix.sort((a, b) => b.amountKg - a.amountKg);

  return {
    source: "fallback_expert_system",
    modelUsed: `${modelName} (Pakar Ransum Presisi)`,
    status: "success",
    analysis: {
      pbbhEvaluation: `Sapi ${cattle.name} (${cattle.breed}) dengan bobot awal ${cattle.currentWeightKg} kg diproyeksikan bertumbuh pada kisaran 1.0 kg/hari sesuai hasil wawancara peternak (target PBBH kalkulasi: ${targetPbbh.toFixed(2)} kg/hari dalam sisa ${safeDays} hari). Kombinasi lengkap 4 konsentrat lapangan mencukupi kebutuhan metabolisme harian.`,
      feedStrategy:
        "Berikan racikan 4 konsentrat komboran (Ampas Tahu 1.5 kg, NutriFeed 1.25 kg, Katul 0.5 kg, dan Bran Pollard 0.25 kg) dibagi 2 kali: pagi hari (07.00 WIB) dan sore hari (16.00 WIB). Hijauan rumput segar disajikan setelah konsentrat habis dikonsumsi.",
      adaptationNote:
        "Komposisi 4 bahan pakan konsentrat lapangan ini terbukti stabil dan aman bagi mikroba rumen tanpa menimbulkan risiko asidosis atau bloat.",
    },
    recommendedMix,
    totalDailyCostRp: totalDailyCost,
    totalPeriodCostRp: totalDailyCost * safeDays,
    managementAdvice: [
      "Sediakan air minum bersih yang dicampur sedikit garam dapur secara ad libitum (selalu tersedia).",
      "Gunakan Bran Pollard yang diseduh air hangat bersama bekatul dan ampas tahu untuk aroma komboran yang sangat gurih.",
      "Pastikan palung pakan selalu dibersihkan dari sisa pakan masam sebelum pemberian pakan baru.",
    ],
    warnings: [
      "Seluruh 4 komponen konsentrat hasil wawancara peternak (Pollard, NutriFeed, Ampas Tahu, Katul) telah digunakan lengkap pada takaran ransum.",
      "Takaran setiap bahan telah dibatasi agar tidak melampaui stok harian yang dimiliki peternak.",
    ],
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as RequestPayload;
    const { cattle, feeds, optimizationResult } = payload;

    if (!cattle || !cattle.name) {
      return NextResponse.json(
        { error: "Data sapi tidak lengkap." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(cattle.currentWeightKg) ||
      !Number.isFinite(cattle.targetWeightKg) ||
      !Number.isFinite(cattle.daysToQurban) ||
      cattle.currentWeightKg <= 0 ||
      cattle.targetWeightKg <= cattle.currentWeightKg ||
      cattle.daysToQurban <= 0
    ) {
      return NextResponse.json(
        { error: "Data bobot atau durasi penggemukan tidak valid." },
        { status: 400 }
      );
    }

    if (!Array.isArray(feeds)) {
      return NextResponse.json(
        { error: "Data bahan pakan tidak valid." },
        { status: 400 }
      );
    }

    // Hanya gunakan bahan yang aktif dan memiliki stok > 0
    const activeFeeds = feeds.filter((feed) => feed.isActive && feed.maxLimitKg > 0);

    if (activeFeeds.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada bahan pakan aktif dengan stok tersedia (> 0 kg)." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const targetPbbh =
      (cattle.targetWeightKg - cattle.currentWeightKg) /
      Math.max(1, cattle.daysToQurban);

    // Jika API Key tidak ada, gunakan sistem pakar langsung
    if (!apiKey) {
      const fallbackResult = buildExpertSystemFallback(
        cattle,
        activeFeeds,
        targetPbbh,
        "Offline Expert Engine"
      );
      return NextResponse.json(fallbackResult);
    }

    const analysisInput = {
      cattle: {
        name: cattle.name,
        breed: cattle.breed,
        currentWeightKg: cattle.currentWeightKg,
        targetWeightKg: cattle.targetWeightKg,
        daysToQurban: cattle.daysToQurban,
        targetPbbhKgPerDay: Number(targetPbbh.toFixed(2)),
      },
      daftarStokPakanPeternak: activeFeeds.map((feed) => ({
        name: feed.name,
        category: feed.category,
        stokTersediaKgPerHari: feed.maxLimitKg,
        hargaPerKgRp: feed.pricePerKg,
        bkPercent: feed.bkPercent,
        pkPercent: feed.pkPercent,
        tdnPercent: feed.tdnPercent,
      })),
      totalJumlahJenisPakanTersedia: activeFeeds.length,
      optimizationResult: optimizationResult ?? null,
    };

    let aiResult: GeminiRationResponse | null = null;

    try {
      const ai = new GoogleGenAI({ apiKey });

      const interaction = await ai.interactions.create({
        model,
        system_instruction: systemInstruction,
        input: `
Analisis data sapi dan seluruh daftar stok pakan peternak berikut, lalu susun rekomendasi ransum komplit:

DATA INPUT:
${JSON.stringify(analysisInput, null, 2)}

INSTRUKSI KHUSUS FORMULASI:
1. HASIL WAWANCARA PETERNAK LAPANGAN MENETAPKAN TAKARAN KONSENTRAT KOMBORAN PER EKOR SAPI:
   - Bran Pollard: 0.25 kg (1/4 kg)
   - NutriFeed: 1.25 kg (1 1/4 kg)
   - Ampas Tahu Basah: 1.50 kg (1 1/2 kg)
   - Katul / Bekatul: 0.50 kg (1/2 kg)
   KEEMPAT KOMPONEN KONSENTRAT INI WAJIB DIGUNAKAN SEMUANYA PADA TABEL TAKARAN RANSUM (TIDAK BOLEH ADA YANG TIDAK DIGUNAKAN ATAU 0 KG).
2. Tambahkan Hijauan Rumput Segar (15 - 30 kg sesuai bobot badan sapi) dan Dami Padi (jika aktif) untuk motilitas rumen dan mencegah asidosis.
3. Pertumbuhan rata-rata harian sapi (PBBH) berada pada kisaran 1.0 kg/hari.
4. Pastikan takaran setiap bahan ('amountKg') TIDAK MELEBIHI stok harian yang tersedia ('stokTersediaKgPerHari').
5. Tuliskan peran nutrisi untuk setiap bahan yang dimasukkan ke dalam racikan.
`,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: rationResponseSchema,
        },
        generation_config: {
          temperature: 0.2,
        },
      });

      let outputText = (interaction as any).output_text;

      if (!outputText && Array.isArray((interaction as any).steps)) {
        for (const step of (interaction as any).steps) {
          if (step?.type === "model_output" && Array.isArray(step?.content)) {
            for (const c of step.content) {
              if (c?.type === "text" && c?.text) {
                outputText = c.text;
                break;
              }
            }
          }
          if (outputText) break;
        }
      }

      if (outputText) {
        aiResult = JSON.parse(outputText) as GeminiRationResponse;
      }
    } catch (genAiErr) {
      console.warn("[GEMINI API WARNING] Gagal memanggil Gemini, menggunakan Fallback Expert Engine:", genAiErr);
    }

    // Jika Gemini gagal atau mengembalikan kurang dari 3 bahan saat stok peternak >= 3 bahan,
    // gunakan fallback expert system yang meracik seluruh stok lengkap!
    if (!aiResult || !aiResult.recommendedMix || aiResult.recommendedMix.length < Math.min(activeFeeds.length, 3)) {
      const fallbackResult = buildExpertSystemFallback(
        cattle,
        activeFeeds,
        targetPbbh,
        model
      );
      if (aiResult?.pbbhEvaluation) {
        fallbackResult.analysis.pbbhEvaluation = aiResult.pbbhEvaluation;
      }
      if (aiResult?.feedStrategy) {
        fallbackResult.analysis.feedStrategy = aiResult.feedStrategy;
      }
      return NextResponse.json(fallbackResult);
    }

    // Validasi dan hitung biaya dari hasil Gemini
    const feedMap = new Map(
      activeFeeds.map((feed) => [feed.name.trim().toLowerCase(), feed])
    );

    const warnings = [...(aiResult.warnings || [])];
    let totalDailyCost = 0;
    const recommendedMix: AiIngredientMixItem[] = [];

    for (const item of aiResult.recommendedMix || []) {
      let feed = feedMap.get(item.name.trim().toLowerCase());
      if (!feed) {
        const query = item.name.trim().toLowerCase();
        feed = activeFeeds.find((f) => {
          const fn = f.name.trim().toLowerCase();
          return fn.includes(query) || query.includes(fn);
        });
      }

      if (!feed) {
        recommendedMix.push({
          name: item.name,
          amountKg: Number(item.amountKg.toFixed(2)),
          morningKg: Number((item.amountKg / 2).toFixed(2)),
          afternoonKg: Number((item.amountKg - item.amountKg / 2).toFixed(2)),
          costRp: 0,
          nutritionalRole: item.nutritionalRole,
        });
        continue;
      }

      const amount = Number(item.amountKg);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      const maxLimit = Number(feed.maxLimitKg);
      let validAmount = Number(amount.toFixed(2));

      // Jika AI merekomendasikan melebihi stok, potong otomatis ke stok maksimal
      if (Number.isFinite(maxLimit) && maxLimit > 0 && validAmount > maxLimit) {
        validAmount = maxLimit;
        warnings.push(
          `Takaran ${item.name} disesuaikan ke batas stok maksimal peternak (${maxLimit} kg/hari).`
        );
      }

      const morningKg = Number((validAmount / 2).toFixed(2));
      const afternoonKg = Number((validAmount - morningKg).toFixed(2));
      const price = Number(feed.pricePerKg);
      const costRp = Math.round(validAmount * price);

      totalDailyCost += costRp;

      recommendedMix.push({
        name: feed.name,
        amountKg: validAmount,
        morningKg,
        afternoonKg,
        costRp,
        nutritionalRole: item.nutritionalRole,
      });
    }

    // Pastikan seluruh 4 komponen konsentrat wajib hasil wawancara peternak ada di recommendedMix
    const mandatoryConcentrates = [
      { key: "polar", defaultKg: 0.25, role: "Meningkatkan palatabilitas (aroma gurih & nafsu makan sapi) serta serat mudah cerna (1/4 kg)." },
      { key: "nutrifeed", defaultKg: 1.25, role: "Konsentrat padat nutrisi terfortifikasi mineral & protein pembentuk karkas kurban (1 1/4 kg)." },
      { key: "ampas", defaultKg: 1.50, role: "Sumber protein basah empuk pemacu sintesis asam amino dan pembesaran otot daging (1 1/2 kg)." },
      { key: "katul", defaultKg: 0.50, role: "Sumber karbohidrat fermentabel rumen & energi murah perangsang mikroba rumen (1/2 kg)." },
    ];

    mandatoryConcentrates.forEach((mand) => {
      const isPresent = recommendedMix.some((m) =>
        m.name.toLowerCase().includes(mand.key)
      );
      if (!isPresent) {
        const feed = activeFeeds.find((f) =>
          f.name.toLowerCase().includes(mand.key)
        );
        if (feed) {
          const validAmount = Math.min(feed.maxLimitKg, mand.defaultKg);
          const morningKg = Number((validAmount / 2).toFixed(2));
          const afternoonKg = Number((validAmount - morningKg).toFixed(2));
          const costRp = Math.round(validAmount * feed.pricePerKg);
          totalDailyCost += costRp;
          recommendedMix.push({
            name: feed.name,
            amountKg: validAmount,
            morningKg,
            afternoonKg,
            costRp,
            nutritionalRole: mand.role,
          });
        }
      }
    });

    // Urutkan bahan dari takaran terbesar ke terkecil
    recommendedMix.sort((a, b) => b.amountKg - a.amountKg);

    const result: AiRationRecommendation = {
      source: "gemini",
      modelUsed: model,
      status: "success",
      analysis: {
        pbbhEvaluation: aiResult.pbbhEvaluation,
        feedStrategy: aiResult.feedStrategy,
        adaptationNote: aiResult.adaptationNote,
      },
      recommendedMix,
      totalDailyCostRp: totalDailyCost,
      totalPeriodCostRp: totalDailyCost * Math.max(1, cattle.daysToQurban),
      managementAdvice: aiResult.managementAdvice || [],
      warnings: [...new Set(warnings)],
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[GEMINI API CRITICAL ERROR]", error);
    return NextResponse.json(
      {
        error: "Gagal memproses rekomendasi ransum AI.",
        detail: error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}
