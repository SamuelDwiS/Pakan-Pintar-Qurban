# TASK PLAN: INTEGRASI AI & ARSITEKTUR SISTEM
**Aplikasi:** Pakan Pintar Qurban  
**Event:** Lomba Prototype Pekan Insinyur Peternakan UGM 2026 (Kategori: Cabang AI & Smart Farming)  
**Status Arsitektur Database:** Hybrid Client-Side Storage (`localStorage` PWA) + Stateless Optimization Engine (Python FastAPI)

---

## 📌 Ringkasan Arsitektur Data & AI
1. **Penyimpanan Data (Database):**
   - Menggunakan penyimpanan persisten lokal browser (`localStorage`) pada PWA Next.js.
   - **Kelebihan untuk Lomba:** Bebas risiko mogok koneksi database (*fail-proof* saat demo tanpa internet), data sapi & timbangan tidak hilang saat refresh/tutup tab.
2. **Mesin AI Backend (Python FastAPI):**
   - Berperan sebagai *stateless computation engine* (Scikit-Learn untuk regresi pertumbuhan bobot & SciPy SLSQP/Linprog untuk optimasi ransum biaya minimum 6 pakan lapangan).
3. **Fallback Engine (Frontend Client):**
   - Berjalan mandiri jika peternak berada di kandang tanpa sinyal internet (*Offline-First*).

---

## 📋 Checklist Rencana Kerja Eksekusi

### [x] FASE 1: Closed-Loop Nutrition & Health Feedback (Intervensi Pakan Cerdas) — SELESAI
*Menghubungkan hasil skrining gejala fisik langsung ke penyesuaian racikan pakan.*
- [x] **1.1. Perluasan Interface Data (`frontend/types/index.ts`)**
  - [x] Menambahkan tipe `DietaryInterventionRecommendation` dan `FeedAdjustmentItem` pada `HealthStatus`.
  - [x] Menyimpan alasan medis, aksi penyesuaian pakan (`TAMBAH`, `KURANGI`, `UTAMAKAN`, `HINDARI_SEMENTARA`), tips operasional peternak, dan override porsi.
- [x] **1.2. Logika Aturan Intervensi Nutrisi (`frontend/lib/fallback-engines.ts`)**
  - [x] *Kasus Nafsu Makan Turun:* Rekomendasikan **+0.5 kg Bran Polar** (meningkatkan aroma & palatabilitas), kurangi dami kasar, berikan tips air garam hangat / molases.
  - [x] *Kasus Bobot Turun / ADG Tertinggal:* Rekomendasikan peningkatan porsi **Nutrifeed (+0.5 kg) & Ampas Tahu (+1.0 kg)** untuk mendongkrak protein pembentuk daging.
  - [x] *Kasus Diare / Kotoran Cair:* Rekomendasikan kurangi ampas tahu basah (-1.5 kg), perbanyak serat kering **Dami Padi (+1.0 kg)** untuk memadatkan feses dan rehidrasi elektrolit.
  - [x] *Kasus Mulut Sariawan:* Larang dami kasar yang melukai gusi; utamakan bekatul halus dan ampas tahu empuk disajikan sebagai komboran bubur halus hangat.
- [x] **1.3. UI Kartu Rekomendasi di Halaman Kesehatan (`frontend/components/HealthBadge.tsx` & `/kesehatan`)**
  - [x] Tampilkan kartu visual *"💡 [Headline Intervensi Pakan AI]"* di bawah kartu status risiko dengan badge delta pakan dan tips aplikatif.
  - [x] Sediakan tombol 1-klik: **`[ 🔄 Sesuaikan di Ransum ]`** yang langsung membuka menu Ransum.

---

### [x] FASE 2: Deteksi Anomali Penurunan Bobot & Kalibrasi Biologis (Ground-Truth Calibration) — SELESAI
*Menjawab skenario jika peternak lupa timbang dan saat ditimbang bobot aktualnya ternyata turun.*
- [x] **2.1. Deteksi Kejutan saat Input Timbangan (`frontend/components/profil/WeightLogManager.tsx` & `CattleCard.tsx`)**
  - [x] Bandingkan bobot timbangan terbaru dengan catatan sebelumnya secara otomatis.
  - [x] Jika terjadi penurunan bobot (`diff < 0`), munculkan banner peringatan anomali: *"⚠️ Anomali Terdeteksi: Bobot Terkini Turun -X kg"*.
  - [x] Berikan deteksi interaktif pada form penimbangan jika angka yang diinput lebih rendah dari bobot sebelumnya.
  - [x] Tampilkan badge status riwayat timbangan tabel: `⚠️ Turun X kg (Anomali)`.
  - [x] Tampilkan status indikator pada kartu sapi di daftar ternak (`CattleCard.tsx`): `⚠️ Turun X kg`.
- [x] **2.2. Rekalkulasi ADG & Batas Kewajaran Biologis (`frontend/components/profil/WeightLogManager.tsx` & `fallback-engines.ts`)**
  - [x] Saat bobot turun dicatat, sistem otomatis mengkalibrasi ulang kebutuhan target PBBH harian: `(Target Bobot - Bobot Terkini) / Sisa Hari`.
  - [x] Jika target PBBH baru melampaui batas biologis ras sapi (>1.5 kg/hari untuk Simental/Limousin atau >0.95 kg/hari untuk Sapi Bali), sistem menampilkan kartu peringatan biologis jujur.
  - [x] AI menyarankan peternak menurunkan target bobot akhir di profil atau menambah masa penggemukan agar sapi tidak dipaksa pakan konsentrat berlebih yang berisiko asidosis/bloat.

---

### [x] FASE 3: Penyelarasan Backend Python dengan 6 Pakan Lapangan (`backend/main.py`) — SELESAI
*Memastikan backend Python 100% selaras dengan 6 pakan lapangan peternak.*
- [x] **3.1. Pembaruan 6 Pakan Riil Peternak di Backend**
  - [x] Memperbarui basis data pakan backend dari 4 bahan menjadi **6 pakan lengkap**: Rumput Segar, Dami Jerami Padi, Nutrifeed (Konsentrat), Bran Polar, Katul (Dedak Padi), Ampas Tahu.
  - [x] Menyelaraskan komposisi nutrisi BK, PK, dan TDN serta harga standar peternak.
  - [x] Menyelaraskan endpoint `GET /api/v1/feeds/default` agar mengembalikan 6 pakan lengkap dengan feed_id yang konsisten.
- [x] **3.2. Penyesuaian Solver SLSQP & Linprog HiGHS**
  - [x] Menghitung kebutuhan nutrisi Kearl (1982) & NRC (BK, PK, TDN, kapasitas rumen).
  - [x] Menambahkan kendala serat hijauan rumen (Rumput + Dami minimal 28% total BK) agar sapi terhindar dari asidosis.
  - [x] Mengintegrasikan model Machine Learning regresi PBBH pada fraksi konsentrat.
  - [x] Menyelaraskan skema DTO request & response pada endpoint `POST /api/v1/ration/optimize`.

---

### [x] FASE 4: Visualisasi Nilai Jual & Hemat Biaya di Dashboard (`frontend/app/page.tsx`) — SELESAI
*Membuktikan nilai ekonomi nyata bagi peternak untuk presentasi juri.*
- [x] **4.1. Panel Komparasi Biaya Pakan Harian (`frontend/components/TechnoEconomicWidget.tsx`)**
  - [x] Menampilkan komparasi biaya pakan konvensional (~Rp 34.000/ekor/hari) vs Ransum Presisi AI (~Rp 22.500/ekor/hari).
  - [x] Menampilkan angka riil penghematan: **Hemat ~Rp 11.500/ekor/hari (~34% efisiensi opex)**.
  - [x] Akumulasi total tabungan biaya pakan peternak selama periode penggemukan.
- [x] **4.2. Proyeksi Nilai Jual Sapi Kurban (Hari Biasa vs Idul Adha)**
  - [x] Komparasi harga jual daging timbang hidup hari biasa (@ Rp 53.000/kg) vs momentum Idul Adha (@ Rp 78.000/kg).
  - [x] Menampilkan nilai tambah kurban (margin ekstra) mencapai **+Rp 10.000.000 - Rp 13.000.000 / ekor**.
  - [x] Simulasi skala usaha interaktif untuk 1 ekor, 5 ekor, dan 10 ekor sapi.
  - [x] Rincian penjelasan ilmiah tekno-ekonomi (substitusi ampas tahu murah & pencegahan under/overfeeding) yang siap dipresentasikan di hadapan dewan juri.

---

### [x] FASE 5: Validasi Kompilasi & Pengujian Akhir — SELESAI
- [x] Menjalankan verifikasi tipe data TypeScript (`tsc --noEmit`) $\rightarrow$ **0 error (Lolos Sempurna)**.
- [x] Menjalankan verifikasi produksi Next.js build (`next build`) $\rightarrow$ **11/11 halaman sukses ter-generate (Exit Code 0)**.
- [x] Memastikan arsitektur PWA offline-first berjalan mulus dan fail-proof untuk demonstrasi lomba.
