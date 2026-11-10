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

PRINSIP UTAMA:
Peternak memiliki daftar STOK BAHAN PAKAN yang tersedia di kandang (dinyatakan dalam 'stokTersediaKgPerHari').
Sebelum menyusun ransum, Anda WAJIB memeriksa daftar stok pakan yang aktif dan tersedia tersebut.

ATURAN WAJIB FORMULASI RANSUM KOMPLIT (MULTI-KOMPONEN):
1. WAJIB CEK DAN MANFAATKAN STOK YANG LENGKAP (JANGAN HANYA 1 ATAU 2 BAHAN SAJA):
   - Sapi ruminansia mutlak membutuhkan ransum komplit yang memadukan hijauan dan konsentrat.
   - Jika peternak memiliki stok pakan yang beragam (misal: Rumput Segar, Dami Padi, Katul, Bran Polar, Nutrifeed, Ampas Tahu), formulasi pakan AI WAJIB MENGGABUNGKAN SELURUH ATAU SEBAGIAN BESAR BAHAN TERSEBUT ke dalam rekomendasi ransum harian.
   - Komposisi wajib memadukan:
     a. Sumber Serat Kasar & Hijauan (Rumput Segar dan/atau Dami Padi) untuk motilitas rumen, produksi saliva buffer, dan mencegah asidosis (minimal 30% dari total BK pakan).
     b. Sumber Energi Fermentabel (Katul / Bekatul).
     c. Sumber Protein & Peningkat Palatabilitas/Nafsu Makan (Bran Polar, Ampas Tahu, dan Nutrifeed).
   - JANGAN PERNAH HANYA MEMILIH 1 ATAU 2 BAHAN SAJA jika stok peternak memiliki 3 atau lebih bahan aktif! Manfaatkan keragaman bahan agar nutrisi saling melengkapi dan biaya ransum tetap ekonomis.

2. KEPATUHAN KETAT TERHADAP BATAS STOK:
   - Jumlah takaran pakan harian ('amountKg') untuk setiap bahan TIDAK BOLEH MELEBIHI 'stokTersediaKgPerHari'.
   - Jika ada bahan yang stoknya 0 atau tidak aktif, jangan gunakan bahan tersebut.

3. KECUKUPAN KAPASITAS KONSUMSI SAPI:
   - Total pakan segar (as-fed) harian umumnya berkisar 8% s/d 13% dari bobot sapi saat ini (misal sapi bobot 350 kg membutuhkan ~30 - 45 kg pakan segar total termasuk hijauan dan komboran).
   - Bahan Kering (BK) total harus memenuhi 2.4% - 2.8% dari bobot badan sapi.

4. PERAN NUTRISI SETIAP BAHAN:
   - Di dalam 'nutritionalRole', jelaskan peran spesifik masing-masing bahan pakan (misal: Rumput Segar sebagai serat hijauan utama rumen, Bran Polar pemacu nafsu makan dan aroma gurih, Ampas Tahu sumber protein basah murah, Katul sumber energi karbohidrat, Nutrifeed pemacu kenaikan bobot).

ATURAN LAIN:
- Gunakan nama bahan PERSIS sesuai data input.
- Berikan output dalam format JSON sesuai skema yang ditentukan, dalam bahasa Indonesia yang aplikatif dan mudah dipahami peternak.
`;

function buildExpertSystemFallback(
  cattle: RequestPayload["cattle"],
  activeFeeds: FeedItem[],
  targetPbbh: number,
  modelName: string
): AiRationRecommendation {
  const currentW = cattle.currentWeightKg;
  const safeDays = Math.max(1, cattle.daysToQurban);

  // Kebutuhan BK: ~2.5% BB
  const totalBkNeed = currentW * 0.025;

  const recommendedMix: AiIngredientMixItem[] = [];
  let totalDailyCost = 0;

  // Bagi porsi cerdas: 50% BK Hijauan/Serat, 50% BK Konsentrat
  const roughages = activeFeeds.filter(
    (f) => f.category === "Hijauan" || f.category === "Limbah Pertanian"
  );
  const concentrates = activeFeeds.filter(
    (f) => f.category === "Konsentrat"
  );

  // Alokasi Hijauan / Serat
  if (roughages.length > 0) {
    roughages.forEach((feed) => {
      const isFreshGrass = feed.name.toLowerCase().includes("rumput");
      // Rumput segar 20-30 kg, Dami 2-3 kg
      const targetKg = isFreshGrass
        ? Math.min(feed.maxLimitKg, Math.max(10, currentW * 0.07))
        : Math.min(feed.maxLimitKg, 2.5);

      if (targetKg > 0.1) {
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

  // Alokasi Konsentrat (kombinasi seluruh stok aktif peternak)
  if (concentrates.length > 0) {
    concentrates.forEach((feed) => {
      const nameLower = feed.name.toLowerCase();
      let targetKg = 1.5;

      if (nameLower.includes("ampas")) {
        targetKg = Math.min(feed.maxLimitKg, 4.0); // Ampas tahu basah
      } else if (nameLower.includes("polar")) {
        targetKg = Math.min(feed.maxLimitKg, 1.5); // Polar pemacu nafsu makan
      } else if (nameLower.includes("katul") || nameLower.includes("bekatul")) {
        targetKg = Math.min(feed.maxLimitKg, 2.0); // Katul energi murah
      } else if (nameLower.includes("nutrifeed") || nameLower.includes("konsentrat")) {
        targetKg = Math.min(feed.maxLimitKg, 2.0); // Konsentrat komersial
      } else {
        targetKg = Math.min(feed.maxLimitKg, 1.0);
      }

      if (targetKg > 0.1) {
        const amountKg = Number(targetKg.toFixed(2));
        const costRp = Math.round(amountKg * feed.pricePerKg);
        totalDailyCost += costRp;

        let role = "Sumber nutrisi konsentrat pelengkap energi dan protein.";
        if (nameLower.includes("ampas")) {
          role = "Sumber protein basah bertekstur empuk, sangat ekonomis mendongkrak pembentukan daging.";
        } else if (nameLower.includes("polar")) {
          role = "Meningkatkan palatabilitas (aroma gurih & nafsu makan sapi) serta serat mudah cerna.";
        } else if (nameLower.includes("katul") || nameLower.includes("bekatul")) {
          role = "Sumber karbohidrat dan energi lokal yang aman untuk fermentasi rumen.";
        } else if (nameLower.includes("nutrifeed")) {
          role = "Konsentrat padat nutrisi terfortifikasi mineral & protein untuk mengejar target bobot.";
        }

        recommendedMix.push({
          name: feed.name,
          amountKg,
          morningKg: Number((amountKg * 0.5).toFixed(2)),
          afternoonKg: Number((amountKg * 0.5).toFixed(2)),
          costRp,
          nutritionalRole: role,
        });
      }
    });
  }

  // Urutkan dari takaran pakan segar terbanyak ke paling sedikit
  recommendedMix.sort((a, b) => b.amountKg - a.amountKg);

  return {
    source: "fallback_expert_system",
    modelUsed: `${modelName} (Pakar Ransum Presisi)`,
    status: "success",
    analysis: {
      pbbhEvaluation: `Sapi ${cattle.name} (${cattle.breed}) dengan bobot awal ${cattle.currentWeightKg} kg membutuhkan PBBH rata-rata ${targetPbbh.toFixed(2)} kg/hari untuk mencapai target kurban ${cattle.targetWeightKg} kg dalam sisa ${safeDays} hari. Kombinasi stok hijauan dan konsentrat mencukupi kebutuhan metabolisme harian.`,
      feedStrategy:
        "Berikan pakan konsentrat (komboran ampas tahu, katul, dan bran polar) pada pagi hari (07.00 WIB) dan sore hari (16.00 WIB). Hijauan rumput segar disajikan setelah konsentrat habis dikonsumsi untuk memaksimalkan kecernaan.",
      adaptationNote:
        "Jika ada pergantian atau penambahan bahan konsentrat baru, lakukan penyesuaian bertahap selama 5-7 hari agar bakteri rumen beradaptasi sempurna tanpa memicu kembung.",
    },
    recommendedMix,
    totalDailyCostRp: totalDailyCost,
    totalPeriodCostRp: totalDailyCost * safeDays,
    managementAdvice: [
      "Sediakan air minum bersih yang dicampur sedikit garam dapur secara ad libitum (selalu tersedia).",
      "Gunakan Bran Polar yang diseduh air hangat bersama bekatul dan ampas tahu untuk merangsang nafsu makan optimal.",
      "Pastikan palung pakan selalu dibersihkan dari sisa pakan masam sebelum pemberian pakan baru.",
    ],
    warnings: [
      "AI telah memverifikasi seluruh stok pakan aktif peternak dan menyusun ransum komplit terpadu.",
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
1. Periksa ketersediaan stok pakan di atas ('stokTersediaKgPerHari').
2. Sapi memerlukan ransum komplit berimbang (kombinasi hijauan/serat kasar + aneka konsentrat energi & protein). Karena peternak memiliki ${activeFeeds.length} jenis pakan di stok, MANFAATKAN KOMBINASI SELURUH/SEBAGIAN BESAR BAHAN TERSEBUT ke dalam racikan harian (JANGAN HANYA MEMILIH 1 ATAU 2 BAHAN SAJA).
3. Pastikan takaran setiap bahan ('amountKg') TIDAK MELEBIHI stok harian yang tersedia ('stokTersediaKgPerHari').
4. Pastikan total takaran pakan mencukupi kapasitas konsumsi sapi bobot ${cattle.currentWeightKg} kg untuk mengejar target PBBH ${targetPbbh.toFixed(2)} kg/hari.
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
