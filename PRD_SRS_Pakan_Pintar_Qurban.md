# SYSTEM DOCUMENTATION: PRD & SRS
## Application Name: Pakan Pintar Qurban
**Event:** Lomba Prototype Pekan Insinyur Peternakan UGM 2026 (Category: Sarjana / Profesi Insinyur)  
**Theme:** Engineering Innovation for Sustainable Livestock Production  
**Team Name:** Pakan Pintar Qurban (Universitas Pignatelli Triputra, Surakarta)  
**Authors:** Isa Bagus Prakoso (Ketua), Samuel Dwi Saputro (Anggota), Aldian Umbu Tamu Ama, S.Si., M.Cs (Dosen Pembimbing)  
**Tech Stack:** Next.js 14+ (TypeScript, Tailwind CSS, PWA), Python 3.11+ (FastAPI, SciPy, Scikit-Learn), PostgreSQL/SQLite.

---

## 1. Context & Purpose for AI IDE Assistants
> **Instruction for AI Agents (Cursor / Copilot / Windsurf / Claude Code):**  
> Document ini adalah Software Requirements Specification (SRS) dan Product Requirement Document (PRD) resmi untuk aplikasi "Pakan Pintar Qurban". Gunakan dokumen ini sebagai konteks utama dalam pembuatan kode, pengerjaan API, arsitektur database, dan antarmuka UI. Jangan mengubah logika domain bisnis, standar nutrisi (NASEM/NRC), atau aturan skrining kesehatan (KIAT VETINDO PMK) yang terdefinisi di sini.

---

## 2. PRODUCT REQUIREMENT DOCUMENT (PRD)

### 2.1 Product Vision & Problem Statement
- **Vision:** Menjadi asisten digital presisi berbasis AI dan Optimization Engineering yang membantu peternak sapi potong rakyat mencapai target bobot kurban Idul Adha dengan biaya pakan minimum serta perlindungan dini dari risiko penyakit.
- **Problem Statement:**
  1. Biaya pakan menyumbang 60-70% total biaya operasional penggemukan sapi potong. Penyusunan pakan secara tradisional sering kali boros atau kurang nutrisi.
  2. Peternak kesulitan mengukur apakah target bobot sapi realistis dicapai sebelum tenggat Idul Adha.
  3. Tanda awal penyakit infeksius (seperti PMK) sering terlewat karena tidak adanya pemantauan rutin data harian (pakan & bobot).

### 2.2 Target Users & Persona
1. **Peternak Sapi Potong / Penggemukan (End-User Utama):** Menginginkan pakan murah dari bahan lokal, prediksi bobot kurban yang pasti, dan antarmuka HP berbahasa Indonesia yang mudah digunakan.
2. **Koperasi Peternakan & Toko Pakan (Mitra Data):** Menyediakan daftar bahan pakan lokal serta memperbarui pasokan harga pakan harian/mingguan.
3. **Dokter Hewan / Puskeswan (Mitra Kesehatan):** Menerima alert rujukan dini dari peternak jika sistem mendeteksi status risiko kesehatan level Merah.

### 2.3 Key Feature Modules
1. **Module 1 - Optimasi Ransum Biaya Minimum (Least-Cost Ration Engine):**
   - Memformulasi kombinasi pakan lokal (Rumput Lapang, Tumpi Jagung, Janggel Jagung, Bungkil Sawit, Dedak Padi, Ampas Tahu) dengan biaya paling murah menggunakan *Linear Programming*.
   - Menjamin terpenuhinya batas minimal Bahan Kering (BK), Protein Kasar (PK), dan *Total Digestible Nutrients* (TDN) sesuai standar NASEM (2015) / NRC (2000).
2. **Module 2 - Estimasi PBBH & Countdown Biaya Kurban (Adaptive Growth Engine):**
   - Menghitung sisa hari menuju tanggal Idul Adha secara real-time.
   - Menghitung kebutuhan Pertambahan Bobot Badan Harian (PBBH / ADG) yang dibutuhkan.
   - Menggunakan model regresi adaptif (*Machine Learning*) untuk menyesuaikan kurva pertumbuhan berdasarkan log penimbangan berkala.
   - Memberi peringatan jika target PBBH melebihi batas biologis sapi (>1.5 kg/hari).
3. **Module 3 - Skrining Dini Kesehatan Ternak (Expert Rule-Based System):**
   - Form checklist gejala visual klinis awal (air liur berlebih, lepuh mulut/kaki, pincang, demam, diare).
   - Deteksi anomali sinyal data: penurunan konsumsi pakan harian >20% atau penurunan bobot drastis.
   - Output indikator risiko 3-level (Hijau/Kuning/Merah) mengacu pada panduan resmi KIAT VETINDO PMK Kementerian Pertanian RI.

---

## 3. SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

### 3.1 System Architecture & Technical Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER (PWA)                        │
│  Next.js 14+ (App Router) | TypeScript | Tailwind CSS | Recharts │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP REST API (JSON)
┌────────────────────────────────┴────────────────────────────────┐
│                     BACKEND LAYER (Python)                      │
│      FastAPI Server (Uvicorn) | Pydantic v2 Validation          │
├───────────────────┬────────────────────────────┬────────────────┤
│ SciPy Linprog Engine│ Adaptive Scikit-Learn Engine│ Expert Rule Engine│
│ (Optimasi Ransum) │ (Prediksi PBBH Regresi)    │ (Skrining PMK) │
└───────────────────┴─────────────┬──────────────┴────────────────┘
                                  │ ORM / Direct Queries
┌─────────────────────────────────┴───────────────────────────────┐
│                       DATA STORAGE LAYER                        │
│ PostgreSQL / SQLite | Seed Data Nutrisi Pakan Lokal & Rules     │
└─────────────────────────────────────────────────────────────────┘
```

#### Tech Stack Specifications:
- **Frontend Framework:** Next.js 14+ (App Router, Server/Client Components).
- **Frontend UI & State:** Tailwind CSS, Lucide React (Icons), Recharts (Charts), React Hook Form.
- **Backend Framework:** Python 3.11+ dengan FastAPI.
- **Math & ML Libraries:** `scipy.optimize.linprog`, `scikit-learn` (Ridge/RandomForest), `numpy`, `pandas`.
- **Database:** PostgreSQL (Production) / SQLite3 (Development/Demo).
- **Communication Protocol:** RESTful API (`application/json`) dengan dukungan CORS untuk `http://localhost:3000`.

---

### 3.2 Detailed Module & Mathematical Specifications

#### Module 1: Linear Programming Optimization Engine (`scipy.optimize.linprog`)
Fungsi Tujuan (Minimize Total Feed Cost):
$$\text{Minimize } Z = \sum_{j=1}^{n} c_j \cdot x_j$$
Di mana:
- $Z$ = Total biaya pakan harian (Rp/ekor/hari).
- $c_j$ = Harga per kg pakan lokal ke-$j$ (Rp/kg).
- $x_j$ = Jumlah kg pakan ke-$j$ yang diberikan (Fresh Feed / As-Fed).

Batas Kendala (Constraints):
1. **Kebutuhan Bahan Kering (BK):** $\sum (BK_j \cdot x_j) \ge BK_{req}$
2. **Kebutuhan Protein Kasar (PK):** $\sum (PK_j \cdot BK_j \cdot x_j) \ge PK_{req}$
3. **Kebutuhan Total Digestible Nutrients (TDN):** $\sum (TDN_j \cdot BK_j \cdot x_j) \ge TDN_{req}$
4. **Batas Maksimal Pemberian Pakan (Palatabilitas & Rumen Health):** $0 \le x_j \le \text{MaxLimit}_j$

**Seed Database Pakan Lokal (Default Values):**
| ID | Nama Pakan | BK (%) | PK (%) | TDN (%) | Max Limit (kg/hari) | Harga Default (Rp/kg) |
|---|---|---|---|---|---|---|
| `feed_1` | Rumput Lapang | 24.4% | 8.0% | 56.2% | 100.0 | Rp 400 |
| `feed_2` | Rumput Gajah | 21.0% | 9.5% | 55.0% | 100.0 | Rp 500 |
| `feed_3` | Bungkil Inti Sawit | 90.3% | 16.8% | 79.0% | 4.0 | Rp 1,750 |
| `feed_4` | Tumpi Jagung | 88.3% | 8.87% | 51.2% | 3.0 | Rp 1,000 |
| `feed_5` | Janggel Jagung | 85.0% | 3.4% | 52.0% | 2.0 | Rp 500 |
| `feed_6` | Dedak Padi Halus | 87.7% | 12.0% | 67.9% | 4.0 | Rp 3,600 |
| `feed_7` | Ampas Tahu | 14.5% | 20.0% | 76.0% | 5.0 | Rp 1,200 |

---

#### Module 2: ADG Trajectory & Adaptive Growth Model
1. **Target ADG Calculation:**
   $$\text{ADG}_{\text{required}} = \frac{\text{Target Weight (kg)} - \text{Current Weight (kg)}}{\text{Days Until Eid al-Adha}}$$
2. **Biologically Feasible Boundary Check:**
   - If $\text{ADG}_{\text{required}} > 1.5 \text{ kg/day}$: Trigger Warning: *"Target PBBH kurang realistis secara biologis (maksimum normal ~1.2-1.5 kg/hari). Disarankan menyesuaikan target bobot atau memperpanjang masa penggemukan."*
3. **Adaptive ML Regression:**
   - Model awal: Formulasi energi NRC ($NE_m$, $NE_g$).
   - Model tuning: Ketika peternak menambah log bobot mingguan ($W_t$), model `scikit-learn` (Ridge Regression) memperbarui koefisien efisiensi pakan ternak spesifik tersebut.

---

#### Module 3: Rule-Based Expert System for Early Disease Screening
Mengacu pada **KIAT VETINDO PMK (Kementerian Pertanian RI)**.

**Symptom Scoring Matrix:**
- `symptom_saliva` (Air liur berlebih / menggantung): Score +30
- `symptom_lesion` (Lepuh pada mulut / lidah / gusi / kaki): Score +40
- `symptom_lameness` (Pincang / tumpuan kaki lemah): Score +20
- `symptom_fever` (Demam tinggi / tubuh panas): Score +15
- `symptom_diarrhea` (Diare / kotoran cair): Score +10
- `anomaly_intake_drop` (Konsumsi pakan turun >20% dalam 2 hari): Score +25
- `anomaly_weight_drop` (Bobot turun >2% dalam seminggu): Score +20

**Risk Level Mapping:**
- **Total Score < 20:** **LEVEL HIJAU (SEHAT / NORMAL)**  
  *Action:* Rutinitas pemberian ransum dan pemantauan biasa.
- **20 <= Total Score < 40:** **LEVEL KUNING (WASPADA)**  
  *Action:* Anomali nafsu makan / gejala ringan terdeteksi. Tingkatkan pengamatan harian, pisahkan pakan, dan berikan vitamin/suplemen pendukung.
- **Total Score >= 40:** **LEVEL MERAH (BAHAYA / INDIKASI PMK)**  
  *Action:* ALERT KHUSUS! Segera isolasi ternak dari kelompoknya. Jangan dipindahkan. Hubungi Dokter Hewan / Puskeswan terdekat.

---

### 3.3 Data Models & Schemas (TypeScript & Pydantic)

#### Pydantic Schemas (Backend - `schemas.py`)
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class FeedItemInput(BaseModel):
    feed_id: str
    feed_name: str
    bk_percent: float
    pk_percent: float
    tdn_percent: float
    max_limit_kg: float
    price_per_kg: float
    is_active: bool = True

class OptimizationRequest(BaseModel):
    cattle_id: str
    current_weight_kg: float
    target_weight_kg: float
    days_to_qurban: int
    available_feeds: List[FeedItemInput]

class FeedRationResult(BaseModel):
    feed_id: str
    feed_name: str
    amount_as_fed_kg: float
    amount_bk_kg: float
    cost_rp: float

class OptimizationResponse(BaseModel):
    status: str
    cattle_id: str
    adg_required_kg: float
    is_adg_feasible: bool
    total_cost_per_day_rp: float
    total_cost_to_qurban_rp: float
    total_bk_provided_kg: float
    total_pk_provided_kg: float
    total_tdn_provided_kg: float
    ration_composition: List[FeedRationResult]
    warning_message: Optional[str] = None

class HealthChecklistInput(BaseModel):
    cattle_id: str
    air_liur_berlebih: bool = False
    lepuh_mulut_kaki: bool = False
    pincang: bool = False
    demam: bool = False
    diare: bool = False
    penurunan_pakan_percent: float = 0.0
    penurunan_bobot_percent: float = 0.0

class HealthScreeningResponse(BaseModel):
    cattle_id: str
    total_score: int
    risk_level: str # "HIJAU" | "KUNING" | "MERAH"
    risk_badge_color: str # "green" | "yellow" | "red"
    summary: str
    recommended_action: str
```

#### TypeScript Interfaces (Frontend - `types/index.ts`)
```typescript
export interface CattleProfile {
  id: string;
  name: string;
  breed: string;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDateQurban: string; // YYYY-MM-DD
}

export interface FeedItem {
  id: string;
  name: string;
  bkPercent: number;
  pkPercent: number;
  tdnPercent: number;
  maxLimitKg: number;
  pricePerKg: number;
  isActive: boolean;
}

export interface OptimizationResult {
  cattleId: string;
  adgRequiredKg: number;
  isAdgFeasible: boolean;
  totalCostPerDayRp: number;
  totalCostToQurbanRp: number;
  totalBkProvidedKg: number;
  totalPkProvidedKg: number;
  totalTdnProvidedKg: number;
  rationComposition: {
    feedId: string;
    feedName: string;
    amountAsFedKg: number;
    amountBkKg: number;
    costRp: number;
  }[];
  warningMessage?: string;
}

export interface HealthStatus {
  cattleId: string;
  totalScore: number;
  riskLevel: 'HIJAU' | 'KUNING' | 'MERAH';
  summary: string;
  recommendedAction: string;
}
```

---

### 3.4 API Endpoints Specification

1. **`POST /api/v1/ration/optimize`**
   - **Description:** Jalankan Solver Linear Programming `scipy.optimize.linprog` untuk menghasilkan racikan pakan termurah.
   - **Request Body:** `OptimizationRequest`
   - **Response:** `OptimizationResponse`

2. **`POST /api/v1/health/screen`**
   - **Description:** Evaluasi kriteria gejala klinis dan perubahan sinyal data untuk menghasilkan skor risiko kesehatan.
   - **Request Body:** `HealthChecklistInput`
   - **Response:** `HealthScreeningResponse`

3. **`GET /api/v1/feeds/default`**
   - **Description:** Mengambil master data pakan lokal bawaan beserta profil nutrisi & harga acuan.
   - **Response:** `List[FeedItemInput]`

---

## 4. DIRECTORY STRUCTURE & DEVELOPMENT GUIDELINES FOR AI IDE

```
pakan-pintar-qurban/
├── backend/
│   ├── main.py                  # FastAPI Application Entry point
│   ├── config.py                # CORS & Application Settings
│   ├── schemas.py               # Pydantic Schemas (Request/Response)
│   ├── engines/
│   │   ├── __init__.py
│   │   ├── linprog_engine.py    # SciPy LP Solver Implementation
│   │   ├── growth_engine.py     # NRC Energy & ADG Calculations
│   │   └── health_engine.py     # Expert Rule-Based Health Scoring
│   ├── data/
│   │   └── default_feeds.json   # Seed Data Pakan Lokal
│   └── requirements.txt         # FastAPI, SciPy, Scikit-Learn, Uvicorn
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx           # PWA & Root Layout
│   │   ├── page.tsx             # Dashboard Utama (Countdown & Ringkasan)
│   │   ├── profil/page.tsx      # Form Input Profil Sapi & Target
│   │   ├── ransum/page.tsx      # Interface Optimasi Pakan & Custom Harga
│   │   └── kesehatan/page.tsx   # Interface Checklist Skrining PMK
│   ├── components/
│   │   ├── CountdownCard.tsx    # Hitung Mundur Idul Adha
│   │   ├── RationTable.tsx      # Tabel Racikan Pakan Minimum
│   │   ├── WeightChart.tsx      # Grafik Recharts Target vs Realisasi
│   │   └── HealthBadge.tsx      # Badge Indikator Hijau/Kuning/Merah
│   ├── lib/
│   │   └── api.ts               # Fetch Client ke FastAPI Backend
│   └── types/
│       └── index.ts             # TypeScript Interfaces
└── README.md
```

### AI IDE Coding Rules:
1. **Clean Code & Modularity:** Backend logic harus dipisah secara ketat di folder `backend/engines/`. Frontend UI harus dipisah di `frontend/components/`.
2. **Error Handling & Fallback:** Pada `frontend/lib/api.ts`, selalu bungkus panggilan `fetch` dalam blok `try-catch`. Jika backend Python tidak merespons, kembalikan data *mock/fallback JSON* agar demo UI tidak terputus (*graceful degradation*).
3. **Responsive & Mobile-First:** Semua antarmuka Tailwind CSS wajib diuji untuk layar HP (`sm:`, `md:`, `lg:`). Gunakan bahasa Indonesia yang ramah peternak.
Target: Demonstrasi aplikasi yang presisi, responsif, dan siap diikutsertakan dalam Tahap Final Lomba Prototype Pekan Insinyur Peternakan UGM 2026.
Target Date: 5 November 2026.
