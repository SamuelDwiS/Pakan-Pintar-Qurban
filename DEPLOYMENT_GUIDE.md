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
