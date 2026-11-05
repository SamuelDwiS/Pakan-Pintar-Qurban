"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useAppState } from "@/context/AppStateContext";
import { DEFAULT_DEMO_ACCOUNTS } from "@/lib/constants";

export function LoginFormCard() {
  const router = useRouter();
  const { login, registerUser } = useAppState();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [identifier, setIdentifier] = useState("peternak@pakanpintar.id");
  const [password, setPassword] = useState("password123");

  // Register form state (1 Role: Peternak Mandiri)
  const [regName, setRegName] = useState("");
  const [regFarmName, setRegFarmName] = useState("");
  const [regIdentifier, setRegIdentifier] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const res = await login(identifier, password);
      if (!res.ok) {
        setErrorMsg(res.error || "Gagal masuk ke akun.");
        return;
      }
      router.replace("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (
    demoIdentifier: string,
    demoPassword: string
  ) => {
    setErrorMsg(null);
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    setIsSubmitting(true);
    try {
      const res = await login(demoIdentifier, demoPassword);
      if (res.ok) {
        router.replace("/");
      } else {
        setErrorMsg(res.error || "Gagal masuk akun demo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (regPassword.length < 6) {
      setErrorMsg("Kata sandi minimal terdiri dari 6 karakter.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await registerUser({
        name: regName,
        identifier: regIdentifier,
        password: regPassword,
        farmName: regFarmName || "Peternakan Rakyat Mandiri",
      });
      if (!res.ok) {
        setErrorMsg(res.error || "Gagal mendaftarkan akun.");
        return;
      }
      router.replace("/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl border border-emerald-200/70 bg-white p-6 shadow-xl shadow-emerald-950/5 sm:p-8">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setErrorMsg(null);
          }}
          className={`rounded-xl py-2.5 text-xs font-bold transition-all sm:text-sm ${
            tab === "login"
              ? "bg-emerald-700 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Masuk Peternak
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register");
            setErrorMsg(null);
          }}
          className={`rounded-xl py-2.5 text-xs font-bold transition-all sm:text-sm ${
            tab === "register"
              ? "bg-emerald-700 text-white shadow-2xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Daftar Kandang Baru
        </button>
      </div>

      {/* Heading */}
      <div className="mt-5 text-center sm:text-left">
        <h2 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
          {tab === "login"
            ? "Masuk ke Kandang Digital Anda"
            : "Registrasi Peternak Mandiri"}
        </h2>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {tab === "login"
            ? "Kelola data master kandang, formulasi ransum AI, dan skrining kesehatan mandiri."
            : "Buat akun peternak untuk mulai mengoptimalkan penggemukan sapi kurban."}
        </p>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {tab === "login" ? (
        <>
          <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Email atau Nomor WhatsApp Peternak
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="peternak@pakanpintar.id"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Kata Sandi
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60"
            >
              <span>{isSubmitting ? "Memproses..." : "Masuk ke Aplikasi"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* 1-Click Demo Peternak Button */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Simulasi Cepat (1-Klik Akun Demo)
            </p>
            <div className="mt-2.5 space-y-2">
              {DEFAULT_DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() =>
                    handleQuickDemoLogin(acc.identifier, acc.password)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-200/90 bg-emerald-50/50 px-3.5 py-3 text-left transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-2xs">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-slate-900 sm:text-sm">
                        {acc.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-emerald-800">
                        {acc.farmName}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                    Masuk &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Lengkap Peternak *
            </label>
            <div className="relative mt-1">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Contoh: Bpk. Hendra Wijaya"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nama Peternakan / Kandang *
            </label>
            <div className="relative mt-1">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={regFarmName}
                onChange={(e) => setRegFarmName(e.target.value)}
                placeholder="Contoh: Kandang Lembu Sejahtera"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Email atau Nomor WhatsApp *
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={regIdentifier}
                onChange={(e) => setRegIdentifier(e.target.value)}
                placeholder="0812xxxxxxx atau email@domain.com"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Kata Sandi (Min. 6 Karakter) *
            </label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Buat kata sandi"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            <span>
              {isSubmitting ? "Mendaftarkan..." : "Daftar & Masuk ke Kandang"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
