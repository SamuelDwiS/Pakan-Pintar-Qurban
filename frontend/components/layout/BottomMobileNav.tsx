"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateContext";
import { MOBILE_NAV_ITEMS } from "./NavbarHeader";

export function BottomMobileNav() {
  const pathname = usePathname();
  const { cattleList, healthByCattleId } = useAppState();

  const hasRedAlert = cattleList.some(
    (c) => healthByCattleId[c.id]?.riskLevel === "MERAH"
  );
  const hasYellowAlert = cattleList.some(
    (c) => healthByCattleId[c.id]?.riskLevel === "KUNING"
  );

  return (
    <nav
      aria-label="Navigasi Bawah HP"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-1.5 pb-[max(env(safe-area-inset-bottom),8px)] pt-1.5 shadow-lg backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.matchPrefix === "/"
              ? pathname === "/"
              : pathname.startsWith(item.matchPrefix);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-extrabold transition-all active:scale-95 ${
                isActive
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {item.href === "/kesehatan" &&
                  (hasRedAlert || hasYellowAlert) && (
                    <span
                      className={`absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ${
                        isActive ? "ring-emerald-700" : "ring-white"
                      } ${
                        hasRedAlert
                          ? "animate-pulse bg-rose-500"
                          : "bg-amber-400"
                      }`}
                    />
                  )}
              </div>
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
