import React from "react";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  children,
  className = "",
  bodyClassName = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-shadow hover:shadow-sm ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-bold tracking-tight text-slate-900 sm:text-base truncate sm:whitespace-normal">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 sm:text-xs line-clamp-1 sm:line-clamp-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-3.5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
