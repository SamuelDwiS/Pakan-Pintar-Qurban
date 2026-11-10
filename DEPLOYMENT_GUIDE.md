# 🚀 PANDUAN DEPLOY HOME SERVER (LXC / DOCKER / NGINX / TAILSCALE)
**Aplikasi:** Pakan Pintar Qurban  
**Target Infrastruktur:** Home Server (LXC Container, Docker Engine, Nginx Reverse Proxy, Tailscale Mesh Network)

---

## 🏗️ 1. Arsitektur Deployment
```
 [HP / Laptop di Venue Lomba UGM]
                 │ (Akses via Tailscale Mesh IP / MagicDNS)
                 ▼
 ┌────────────────────────────────────────────────────────┐
 │ Home Server (LXC / Host dengan Tailscale)              │
 │                                                        │
 │   Nginx Reverse Proxy (Port 80 / 443)                  │
 │      ├── /        ──► Docker: Frontend (Port 3000)     │
 │      └── /api/    ──► Docker: Backend  (Port 8000)     │
 │                                                        │
 │   Docker Containers:                                   │
 │      ├── pakan-backend  (Python 3.11 FastAPI + SLSQP)  │
 │      └── pakan-frontend (Next.js 16 Production)        │
 └────────────────────────────────────────────────────────┘
```

---

## 📦 2. Langkah Cepat Deploy via Docker Compose

### Langkah 1: Clone / Copy Folder Project ke Home Server / LXC
Salin direktori project ke home server Anda (misal ke `/opt/pakan-pintar` atau `~/pakan-pintar`):
```bash
git clone <repo-url> /opt/pakan-pintar
cd /opt/pakan-pintar
```

### Langkah 2: Build & Jalankan Container
Jalankan satu perintah berikut:
```bash
docker compose up -d --build
```

Docker akan secara otomatis:
1. Meng-compile image **Python 3.11 Backend** lengkap dengan library AI (`scipy`, `scikit-learn`, `fastapi`, `pandas`).
2. Meng-compile image **Next.js Production Frontend** (multi-stage build).
3. Menjalankan kedua container:
   - Backend di port `8000`
   - Frontend di port `3000`

### Langkah 3: Verifikasi Container Berjalan
```bash
docker compose ps
```
Hasil:
- `pakan-backend`: `Up (healthy)` di port `0.0.0.0:8000->8000/tcp`
- `pakan-frontend`: `Up` di port `0.0.0.0:3000->3000/tcp`

Test API backend:
```bash
curl http://localhost:8000/
# Output: {"app":"Pakan Pintar Qurban API","status":"operational",...}
```

---

## 🌐 3. Konfigurasi Nginx Reverse Proxy (Integrasi Tailscale)

Buka konfigurasi Nginx di LXC / Home Server Anda:
```bash
sudo nano /etc/nginx/sites-available/pakan-pintar.conf
```

Tempel konfigurasi berikut:
```nginx
server {
    listen 80;
    # Ganti dengan Tailscale IP server Anda atau MagicDNS (misal: pakan-server.tailnet.ts.net)
    server_name 100.x.y.z pakan.local;

    # Gzip Compression untuk performa cepat di HP/Venue Lomba
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 1. Frontend Next.js PWA
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

    # 2. Backend FastAPI REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Swagger UI Interaktif untuk Presentasi Juri
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host $host;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pakan-pintar.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔒 4. Akses via Tailscale Saat Penjurian Lomba di UGM
1. Pastikan Tailscale aktif di Home Server:
   ```bash
   tailscale status
   ```
2. Di laptop / HP yang Anda bawa ke venue lomba UGM:
   - Nyalakan aplikasi **Tailscale**.
   - Buka browser dan ketik alamat Tailscale IP server Anda:
     - Web App: `http://100.x.y.z` atau `http://100.x.y.z:3000`
     - Backend API Docs (Swagger): `http://100.x.y.z/docs` atau `http://100.x.y.z:8000/docs`
3. **Pamerkan ke Dewan Juri:**
   - Tunjukkan sistem berjalan di cloud/server pribadi Anda secara live.
   - Buka halaman `/docs` untuk menunjukkan endpoint optimasi AI FastAPI.
   - Buka halaman Dashboard untuk simulasi formulasi pakan dan margin Idul Adha.

