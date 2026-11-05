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
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 sm:p-6 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

