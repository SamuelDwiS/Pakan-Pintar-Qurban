"use client";

import React from "react";
import { Activity, Calculator, Scale, Sparkles } from "lucide-react";
import { LoginFormCard } from "@/components/auth/LoginFormCard";
import { BrandLogo } from "@/components/ui/BrandLogo";

const FEATURE_HIGHLIGHTS = [
  {
    title: "Optimasi Ransum Biaya Minimum",
    desc: "Formulasi pakan lokal termurah menggunakan Linear Programming sesuai standar nutrisi NASEM/NRC.",
    icon: Calculator,
  },
  {
    title: "Manajemen Multi-Sapi & Proyeksi Bobot",
    desc: "Kelola banyak ternak sekaligus, pantau countdown Idul Adha, dan kurva pertumbuhan adaptif.",
    icon: Scale,
  },
  {
    title: "Skrining Dini Kesehatan PMK",
    desc: "Deteksi risiko Penyakit Mulut dan Kuku berbasis aturan KIAT VETINDO Kementerian Pertanian RI.",
    icon: Activity,
  },
] as const;

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-50 lg:grid-cols-12">
      {/* Left Hero Branding Panel (Desktop) — Tanpa Logo karena Logo Dipindah ke Atas Card Login */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-10 text-white lg:col-span-6 lg:flex xl:p-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-emerald-100 ring-1 ring-white/20 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>AI Precision Livestock Farming &bull; Peternak Mandiri</span>
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            Asisten Digital Presisi Penggemukan Sapi Kurban
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-emerald-100/90 xl:text-base">
            Bantu peternak rakyat mencapai target bobot sapi Idul Adha secara
            realistis dengan biaya pakan minimum serta perlindungan dini dari
            risiko penyakit infeksius tanpa ketergantungan pihak ketiga.
          </p>
        </div>

        <div className="relative z-10 my-8 space-y-4">
          {FEATURE_HIGHLIGHTS.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-start gap-3.5 rounded-2xl bg-white/10 p-4 backdrop-blur-xs ring-1 ring-white/15"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-emerald-100/85">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="relative z-10 text-xs text-emerald-200/80">
          Pakan Pintar Qurban &bull; Progressive Web Application (PWA)
        </p>
      </div>

      {/* Right Login / Register Form Area — Logo Berada Tepat di Atas Card Form Login */}
      <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:col-span-6 lg:px-12">
        <div className="mb-5 flex flex-col items-center text-center">
          <BrandLogo variant="hero" />
          <p className="mt-2.5 max-w-xs text-xs font-medium text-slate-600 lg:hidden">
            Asisten Digital Optimasi Ransum &amp; Deteksi Dini PMK Sapi Kurban
          </p>
        </div>

        <LoginFormCard />
      </div>
    </div>
  );
}
