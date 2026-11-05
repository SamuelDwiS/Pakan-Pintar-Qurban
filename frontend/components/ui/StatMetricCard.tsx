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
      className={`flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-xs transition-all hover:shadow-sm sm:p-5 ${styles.ringBorder}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 sm:text-sm">
          {label}
        </span>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {value}
          </p>
          {badgeText && (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${styles.badgeBg}`}
            >
              {badgeText}
            </span>
          )}
        </div>
        {subtext && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

