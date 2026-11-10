# 🐄 Pakan Pintar Qurban
> **Smart Livestock AI System for Precision Cattle Fattening & Qurban Feasibility**  
> *Sistem Cerdas Formulasi Ransum Biaya Terendah (Least-Cost Formulation) & Pemantauan Kesehatan Sapi Berbasis AI.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash-4285F4?logo=google)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Tentang Proyek

**Pakan Pintar Qurban** adalah platform *smart livestock* presisi yang dirancang untuk membantu peternak sapi potong lokal mencapai target bobot kurban secara optimal, hemat biaya, dan sehat. 

Menjelang Idul Adha, peternak rakyat kerap menghadapi tantangan:
1. **Biaya pakan konsentrat komersial yang tinggi** yang menggerus margin keuntungan.
2. **Kenaikan bobot harian (ADG/PBBH) yang lambat atau meleset** akibat formulasi pakan yang tidak seimbang.
3. **Risiko gangguan pencernaan (asidosis rumen/bloat)** dan ancaman penyakit menular seperti PMK.

Sistem ini memadukan **Linear Programming (SLSQP / HiGHS)** berbasis standar internasional **Kearl (1982)** & **NASEM/NRC Tropis** dengan kecerdasan generatif **Google Gemini Live AI** serta validasi data empiris peternak sapi lokal.

---

## ✨ Fitur Utama

- 🎯 **Optimasi Ransum Biaya Minimum (Least-Cost Formulation)**  
  Menghitung takaran pakan harian presisi untuk memenuhi kebutuhan Bahan Kering (BK), Protein Kasar (PK), dan *Total Digestible Nutrients* (TDN) dengan biaya harian serendah mungkin tanpa melampaui kapasitas tampung rumen sapi.
- 🤖 **AI Ration Nutrition Advisor (Google Gemini Live API)**  
  Analisis kecukupan nutrisi berbasis AI yang memetakan strategi komboran, jadwal porsi pagi & sore, saran manajemen palatabilitas, serta fase adaptasi mikroba rumen bagi ternak. Dilengkapi *Offline Expert Engine* sebagai backup otomatis jika koneksi internet terputus.
- 🩺 **Skrining Kesehatan & Deteksi Dini Penyakit (PMK)**  
  Pemantauan skor risiko kesehatan ternak secara bertingkat (Hijau, Kuning, Merah) dengan tombol kontak darurat langsung ke Mantri / Dokter Hewan via WhatsApp.
- 📈 **Analisis Tekno-Ekonomis & Proyeksi Margin Kurban**  
  Simulasi *Break Even Point* (BEP), estimasi margin keuntungan penjualan kurban, dan kalkulasi total modal pakan hingga Hari Raya Idul Adha.
- 📱 **Progressive Web App (PWA) Mobile-First**  
  Tampilan responsif, cepat, dan ringan yang nyaman digunakan langsung dari smartphone peternak di kandang maupun komputer admin.

---

## 🌾 Resep Pakan Lapangan (Validasi Peternak Lokal)

Sistem mengadopsi formulasi empiris racikan komboran peternak sapi potong lokal (target PBBH $\approx$ **1.0 kg/hari**):

| Bahan Pakan | Kategori | Satuan Acuan | Harga / kg | Takaran Harian / Ekor | Pagi (07:00) | Sore (16:00) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Bran Pollard** | Konsentrat | Rp 350.000 / 50 kg | **Rp 7.000** | **0.25 kg** *(1/4 kg)* | 0.125 kg | 0.125 kg |
| **NutriFeed** | Konsentrat | Rp 120.000 / 50 kg | **Rp 2.400** | **1.25 kg** *(1 1/4 kg)* | 0.625 kg | 0.625 kg |
| **Ampas Tahu Basah** | Konsentrat | Rp 50.000 / Ember (~5 kg) | **Rp 10.000** | **1.50 kg** *(1 1/2 kg)* | 0.750 kg | 0.750 kg |
| **Katul (Dedak Padi)** | Konsentrat | Rp 150.000 / 50 kg | **Rp 3.000** | **0.50 kg** *(1/2 kg)* | 0.250 kg | 0.250 kg |
| **Rumput Segar** | Hijauan | Rp 500 / kg | **Rp 500** | **15 – 30 kg** *(dinamis)* | 40% | 60% |
| **Dami (Jerami Padi)**| Serat Kasar | Rp 400 / kg | **Rp 400** | **1 – 2 kg** *(dinamis)* | Sesuai motilitas rumen |

*Keempat bahan konsentrat di atas merupakan komboran wajib (total 3.5 kg/hari) yang dipertahankan dalam ransum, sementara hijauan dan dami menyesuaikan bobot badan dan kapasitas rumen sapi.*

---

## 🛠️ Arsitektur & Teknologi

```
┌────────────────────────────────────────────────────────┐
│                   PWA Client (Browser)                 │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Next.js Frontend      │ │      FastAPI Backend      │
│        (Port 3000)        │ │        (Port 8001)        │
│  - React 19 + Tailwind v4 │ │  - SciPy SLSQP Solver     │
│  - PWA Offline Support    │ │  - Linear Regression ADG  │
│  - Google GenAI SDK       │ │  - Swagger UI /docs       │
└─────────────┬─────────────┘ └───────────────────────────┘
              │
              ▼
┌───────────────────────────┐
│   Google Gemini Live API  │
│     (gemini-3.6-flash)    │
└───────────────────────────┘
```

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons.
- **Backend**: FastAPI, Python 3.11, SciPy (SLSQP Optimizer), Scikit-Learn, Pydantic v2.
- **AI & Reasoning**: Google GenAI SDK (`@google/genai`), Google Gemini 3.6 Flash dengan fallback ke *Expert Rule Engine*.
- **Containerization**: Docker Multi-stage Builds & Docker Compose.

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Prasyarat
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose **ATAU**
- Node.js 20+ dan Python 3.11+ (jika dijalankan manual tanpa Docker).
- Google Gemini API Key ([Dapatkan di Google AI Studio](https://aistudio.google.com/)).

---

### 2. Menjalankan dengan Docker Compose (Direkomendasikan)

1. **Clone repository:**
   ```bash
   git clone https://github.com/SamuelDwiS/Pakan-Pintar-Qurban.git
   cd Pakan-Pintar-Qurban
   ```

2. **Buat file environment:**
   Buat file `.env` di folder root project:
   ```bash
   cat << 'EOF' > .env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.6-flash
   EOF
   ```

3. **Jalankan container:**
   ```bash
   docker compose up -d --build
   ```

4. **Akses aplikasi:**
   - **Frontend Web / PWA**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Swagger Docs**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

### 3. Menjalankan di Mode Development Lokal (Tanpa Docker)

**Langkah A: Menjalankan Backend (FastAPI)**
```bash
cd backend
python -m venv .venv
# Aktifkan virtual environment (Windows: .venv\Scripts\activate | Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Langkah B: Menjalankan Frontend (Next.js)**
```bash
cd frontend
cp .env.example .env.local   # Isi GEMINI_API_KEY Anda
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 🌐 Panduan Deployment di Server (Nginx & Tailscale)

Jika mendeploy di server produksi / Proxmox LXC dengan reverse proxy Nginx:

<details>
<summary><b>Klik untuk melihat contoh konfigurasi Nginx</b></summary>

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 1. Frontend Next.js PWA & Gemini AI Route (Port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Backend FastAPI AI Engine (Port 8001)
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Swagger UI Interaktif (Port 8001)
    location /docs {
        proxy_pass http://127.0.0.1:8001/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8001/openapi.json;
        proxy_set_header Host $host;
    }
}
```
</details>

---

## 📁 Struktur Direktori

```text
PakanPintarQurban/
├── backend/
│   ├── dataset/             # Dataset wawancara & pelatihan model PBBH
│   ├── Dockerfile           # Multi-stage Dockerfile FastAPI
│   ├── main.py              # Endpoint API & solver SLSQP Least-Cost
│   └── requirements.txt     # Dependensi Python
├── frontend/
│   ├── app/                 # Next.js App Router (Ransum, Profil, Master, Kesehatan)
│   │   └── api/ai/          # Endpoint internal integrasi Gemini Live
│   ├── components/          # Komponen UI interaktif (RationTable, HealthBadge, dll)
│   ├── lib/                 # Solver fallback, konstanta pakan, & formatter
│   ├── public/              # Ikon PWA, logo, & aset statis
│   └── Dockerfile           # Standalone production runner Next.js
├── docker-compose.yml       # Orkestrasi container frontend & backend
└── README.md                # Dokumentasi proyek
```

---

## 👥 Tim Pengembang

Proyek ini dikembangkan dalam rangka inovasi dan riset teknologi peternakan presisi:
- **Isa Bagus Prakoso** (Ketua Tim / Peneliti)
- **Samuel Dwi Saputro** (Anggota Tim / Software Engineer)
- **Aldian Umbu Tamu Ama, S.Si., M.Cs** (Dosen Pembimbing)

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.
