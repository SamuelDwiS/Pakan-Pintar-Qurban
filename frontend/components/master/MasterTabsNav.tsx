"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Warehouse } from "lucide-react";

const TABS = [
  {
    href: "/master-kandang",
    label: "Master Kandang & Musim Kurban",
    icon: Warehouse,
  },
  {
    href: "/master-pakan",
    label: "Master Pakan Lokal & Ras Sapi",
    icon: Database,
  },
] as const;

export function MasterTabsNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-2xs">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:flex-initial sm:text-sm ${
              isActive
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

