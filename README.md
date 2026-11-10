# 🐄 Pakan Pintar Qurban — AI Precision Livestock Nutrition & Management System
> **Solusi Formulasi Ransum Biaya Minimum Berbasis AI & Machine Learning untuk Penggemukan Sapi Potong Qurban**  
> Dikembangkan untuk kompetisi inovasi peternakan (Pekan Insinyur Peternakan UGM).

---

## 📌 Ringkasan Sistem
**Pakan Pintar Qurban** adalah platform *smart livestock* presisi yang mengintegrasikan:
1. **Machine Learning (Linear Regression)**: Memprediksi Pertambahan Bobot Badan Harian (PBBH / ADG) berdasarkan fraksi konsentrat komboran.
2. **Sequential Least Squares Programming (SLSQP) & Linear Programming (HiGHS)**: Menyusun ransum biaya termurah (*Least-Cost Formulation*) berbasis standar kebutuhan nutrisi **Kearl (1982) & NASEM/NRC Tropis** (Bahan Kering, Protein Kasar, TDN, dan kapasitas rumen).
3. **Google Gemini Live AI**: Memberikan analisis strategi pakan harian, jadwal pemberian porsi pagi/sore, dan catatan adaptasi mikroba rumen.
4. **PWA Mobile-First**: Antarmuka responsif ramah peternak dengan dukungan offline fallback.

---

## 🌾 Komposisi Ransum Lapangan Hasil Wawancara Peternak

Berdasarkan validasi wawancara peternak sapi lapangan (proyeksi target PBBH $\approx$ **1.0 kg/hari**):

| Bahan Pakan | Kategori | Satuan Pembelian | Harga / kg | Takaran Harian / Ekor | Pagi (07:00) | Sore (16:00) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **Bran Pollard** | Konsentrat | Rp 350.000 / 50 kg | **Rp 7.000** | **0.25 kg** *(1/4 kg)* | 0.125 kg | 0.125 kg |
| **NutriFeed** | Konsentrat | Rp 120.000 / 50 kg | **Rp 2.400** | **1.25 kg** *(1 1/4 kg)* | 0.625 kg | 0.625 kg |
| **Ampas Tahu Basah** | Konsentrat | Rp 50.000 / Ember (~5 kg) | **Rp 10.000** | **1.50 kg** *(1 1/2 kg)* | 0.750 kg | 0.750 kg |
| **Katul (Dedak Padi)** | Konsentrat | Rp 150.000 / 50 kg | **Rp 3.000** | **0.50 kg** *(1/2 kg)* | 0.250 kg | 0.250 kg |
| **Rumput Segar** | Hijauan | Rp 500 / kg | **Rp 500** | **15 – 30 kg** *(dinamis)* | 40% | 60% |
| **Dami (Jerami Padi)**| Serat Kasar | Rp 400 / kg | **Rp 400** | **1 – 2 kg** *(dinamis)* | Sesuai kebutuhan rumen |

*Keempat bahan konsentrat di atas adalah **resep tetap komboran** (3.5 kg/hari) yang selalu dialokasikan lengkap tanpa ada yang diabaikan. Hijauan dan dami bergerak dinamis menyesuaikan bobot badan dan kapasitas rumen sapi.*

---

## 🚀 Panduan Deployment Home Server (Proxmox LXC / Docker / Tailscale / Nginx)

### Arsitektur Port & Jaringan
```
 [HP / Laptop Penguji di Venue]
              │ (Akses via Tailscale Mesh IP / MagicDNS)
              ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ Home Server (Proxmox LXC / Host dengan Tailscale)            │
 │                                                              │
 │   Nginx Reverse Proxy (Port 80 / 443)                        │
 │      ├── /        ──► Docker Frontend Next.js (Port 3000)    │
 │      ├── /api/v1/ ──► Docker Backend FastAPI  (Port 8001)    │
 │      └── /docs    ──► Swagger API Docs        (Port 8001)    │
 │                                                              │
 │   Docker Containers:                                         │
 │      ├── pakan-backend  (Python 3.11 + SLSQP Solver) :8001   │
 │      └── pakan-frontend (Next.js 15 PWA + Gemini AI) :3000   │
 └──────────────────────────────────────────────────────────────┘
```

---

### Langkah 1: Persiapan Environment File
Di dalam folder `frontend/`, buat file `.env` untuk API Gemini:
```bash
echo "GEMINI_API_KEY=AIzaSy..." > frontend/.env
```

---

### Langkah 2: Menjalankan Aplikasi via Docker Compose
Jalankan perintah berikut di folder root project:
```bash
docker compose up -d --build
```

Verifikasi container berjalan normal:
```bash
docker compose ps
```
Status yang diharapkan:
* `pakan-backend`: `Up (healthy)` di port `0.0.0.0:8001->8000/tcp`
* `pakan-frontend`: `Up` di port `0.0.0.0:3000->3000/tcp`

Uji endpoint backend:
```bash
curl http://localhost:8001/
# Output: {"app":"Pakan Pintar Qurban API","status":"operational",...}
```

---

### Langkah 3: Konfigurasi Nginx Reverse Proxy

> [!IMPORTANT]
> **PENTING UNTUK MENCEGAH ERROR 404:**  
> Jangan gunakan `location /api/` karena akan menabrak rute internal Next.js (`/api/ai/ration-recommendation`).  
> Gunakan `location /api/v1/` untuk Backend Python, dan biarkan `location /` menangani Frontend & Gemini AI.

Buka konfigurasi Nginx di server Anda:
```bash
sudo nano /etc/nginx/sites-available/pakan-pintar.conf
```

Salin dan tempel konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name _; # Menerima akses IP Lokal, Tailscale IP (100.x.y.z), atau MagicDNS

    client_max_body_size 20M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 1. Frontend Next.js PWA & Gemini AI Route (Port 3000)
    # Menangani UI dan endpoint internal /api/ai/ration-recommendation
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

    # 2. Backend FastAPI AI Engine (Port 8001) - KHUSUS rute /api/v1/
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Swagger UI Interaktif API Documentation (Port 8001)
    location /docs {
        proxy_pass http://127.0.0.1:8001/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8001/openapi.json;
        proxy_set_header Host $host;
    }
}
```

Aktifkan konfigurasi dan reload Nginx:
```bash
sudo ln -sf /etc/nginx/sites-available/pakan-pintar.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### Langkah 4: Akses via Tailscale Saat Penjurian / Demo
1. Pastikan status Tailscale aktif di server:
   ```bash
   tailscale status
   ```
2. Dari laptop atau HP:
   * Buka browser dan masukkan alamat MagicDNS / IP Tailscale Anda (misal: `http://my-webserver.tailnet.ts.net` atau `http://100.x.y.z`).
   * **Dashboard & Rekomendasi AI**: `http://my-webserver.tailnet.ts.net/ransum`
   * **Dokumentasi API Swagger**: `http://my-webserver.tailnet.ts.net/docs`

---

### Perintah Cepat Redeploy / Update Kode
Jika ada commit baru dari GitHub:
```bash
git pull origin isa
docker compose down
docker compose up -d --build
```

