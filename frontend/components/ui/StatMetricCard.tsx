import React from "react";

type Tone = "emerald" | "amber" | "rose" | "sky" | "slate";

interface StatMetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  tone?: Tone;
  badgeText?: string;
}

const TONE_STYLES: Record<
  Tone,
  { iconBg: string; badgeBg: string; ringBorder: string }
> = {
  emerald: {
    iconBg: "bg-emerald-100/80 text-emerald-700",
    badgeBg: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ringBorder: "border-emerald-200/70",
  },
  amber: {
    iconBg: "bg-amber-100/80 text-amber-700",
    badgeBg: "bg-amber-50 text-amber-800 ring-amber-200",
    ringBorder: "border-amber-200/80",
  },
  rose: {
    iconBg: "bg-rose-100/80 text-rose-700",
    badgeBg: "bg-rose-50 text-rose-700 ring-rose-200",
    ringBorder: "border-rose-200/80",
  },
  sky: {
    iconBg: "bg-sky-100/80 text-sky-700",
    badgeBg: "bg-sky-50 text-sky-700 ring-sky-200",
    ringBorder: "border-sky-200/70",
  },
  slate: {
    iconBg: "bg-slate-100 text-slate-700",
    badgeBg: "bg-slate-100 text-slate-700 ring-slate-200",
    ringBorder: "border-slate-200",
  },
};

export function StatMetricCard({
  label,
  value,
  subtext,
  icon,
  tone = "emerald",
  badgeText,
}: StatMetricCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-3.5 sm:p-5 shadow-xs transition-all hover:shadow-sm ${styles.ringBorder}`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-xs font-semibold text-slate-600 sm:text-sm">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <p className="text-base sm:text-2xl font-black tracking-tight text-slate-900">
            {value}
          </p>
          {badgeText && (
            <span
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold ring-1 ring-inset ${styles.badgeBg}`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {subtext && (
          <p className="mt-1 text-[11px] sm:text-xs text-slate-500 line-clamp-1 sm:line-clamp-none">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
