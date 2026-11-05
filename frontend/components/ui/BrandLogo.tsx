import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "hero" | "header" | "icon";
  tone?: "dark" | "light";
  subtitle?: string;
  className?: string;
}

export function BrandLogo({
  variant = "header",
  tone = "dark",
  subtitle = "AI Ransum & Skrining PMK",
  className = "",
}: BrandLogoProps) {
  if (variant === "hero") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white p-2.5 shadow-md ring-1 ring-emerald-200/90 sm:h-32 sm:w-32">
          <Image
            src="/logo.png"
            alt="Logo Pakan Pintar Qurban"
            width={136}
            height={136}
            priority
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-2xs ${
          tone === "light"
            ? "ring-1 ring-white/30"
            : "ring-1 ring-slate-200/90"
        } ${className}`}
      >
        <Image
          src="/logo.png"
          alt="Logo Pakan Pintar Qurban"
          width={36}
          height={36}
          priority
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 overflow-hidden ${className}`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-2xs ${
          tone === "light"
            ? "ring-1 ring-white/30"
            : "ring-1 ring-emerald-200/80"
        }`}
      >
        <Image
          src="/logo.png"
          alt="Logo Pakan Pintar Qurban"
          width={38}
          height={38}
          priority
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <span
          className={`block truncate text-sm font-extrabold tracking-tight ${
            tone === "light" ? "text-white" : "text-slate-900"
          }`}
        >
          Pakan Pintar Qurban
        </span>
        {subtitle && (
          <p
            className={`truncate text-[11px] font-medium ${
              tone === "light" ? "text-emerald-200/90" : "text-slate-500"
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
