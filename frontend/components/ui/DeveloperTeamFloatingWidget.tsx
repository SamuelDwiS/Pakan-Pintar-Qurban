"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  GraduationCap,
  Mail,
  MessageCircle,
  Sparkles,
  Users,
  X,
} from "lucide-react";

export function DeveloperTeamFloatingWidget() {
  // Otomatis terbuka sebagai pop-up selamat datang / kemitraan saat aplikasi dibuka
  const [isOpen, setIsOpen] = useState(true);

  // Kontak WhatsApp Tim Pengembang
  const whatsappNumber = "6281325368829";
  const defaultMessage = encodeURIComponent(
    "Halo Tim Pengembang Pakan Pintar Qurban, saya tertarik untuk konsultasi dan implementasi sistem pakan presisi di peternakan kami."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;
  const emailUrl =
    "mailto:isabagusprakoso@gmail.com?subject=Konsultasi%20Kemitraan%20Pakan%20Pintar%20Qurban";

  return (
    <>
      {/* 1. Modal Pop-up Terbuka Otomatis Setiap Buka Aplikasi */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-400/50 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 text-white shadow-2xl ring-1 ring-white/10 sm:p-7">
            {/* Dekorasi Cahaya Latar Belakang (Glow Effects) */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />

            {/* Header Pop-up */}
            <div className="relative z-10 flex items-start justify-between border-b border-emerald-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                    <Sparkles className="h-3 w-3" />
                    Kemitraan &amp; Adopsi Teknologi
                  </span>
                  <span className="text-[11px] font-medium text-emerald-200/80">
                    • Smart Livestock AI
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  Pakan Pintar Qurban
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
                title="Tutup Pop-up"
                aria-label="Tutup Pop-up"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Konten Utama Pop-up */}
            <div className="relative z-10 mt-4 space-y-4 text-xs text-slate-300">
              <div className="space-y-1.5">
                <h4 className="text-base font-extrabold text-white sm:text-lg">
                  Tertarik Mengimplementasikan Sistem Ini di Peternakan Anda?
                </h4>
                <p className="leading-relaxed text-slate-300 text-xs sm:text-sm">
                  Kami membuka kolaborasi kemitraan dan pendampingan formulasi pakan presisi untuk kelompok peternak (poktan), koperasi sapi, pengelola kurban komunal, hingga dinas peternakan.
                </p>
              </div>

              {/* Info Tim Peneliti & Dosen Pembimbing */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/30 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Tim Inovasi &amp; Pengembang (Pekan Insinyur Peternakan UGM):</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 pl-1 text-[11px] text-slate-200 sm:grid-cols-2">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                    <span className="font-bold text-white">Isa Bagus Prakoso</span>
                    {/* <span className="text-emerald-400 text-[10px]">(Ketua / Peneliti)</span> */}
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                    <span className="font-bold text-white">Samuel Dwi Saputro</span>
                    {/* <span className="text-emerald-400 text-[10px]">(Software Engineer)</span> */}
                  </div>
                  <div className="col-span-1 border-t border-emerald-500/20 pt-1.5 text-slate-400 flex items-center gap-1 sm:col-span-2">
                    <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Dosen Pembimbing: <strong className="text-slate-200">Aldian Umbu Tamu Ama, S.Si., M.Cs</strong></span>
                  </div>
                </div>
              </div>

              {/* Tombol Aksi Kemitraan */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-emerald-950/50 transition-all hover:scale-102 hover:from-emerald-300 hover:to-teal-300 active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 fill-current text-slate-950" />
                  <span>Hubungi Pengembang (WhatsApp)</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href={emailUrl}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Kerjasama</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-950/50 py-2.5 font-bold text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
                  >
                    <span>Lanjut ke Aplikasi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Tombol Mengambang (Floating Action Button) di Pojok Kanan Bawah saat Pop-up Ditutup */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3 text-white shadow-xl ring-4 ring-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-900/40 active:scale-95 cursor-pointer"
            aria-label="Info Pengembang & Kemitraan"
            title="Klik untuk info pengembang & kemitraan"
          >
            {/* Animasi Ping Efek Notifikasi/Asisten */}
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>

            <MessageCircle className="h-5 w-5 transition-transform group-hover:rotate-12" />

            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Info &amp; Kemitraan
              </span>
              <span className="text-xs font-black tracking-tight text-white">
                Kontak Pengembang
              </span>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
