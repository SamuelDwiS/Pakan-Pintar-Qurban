import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "danger";

interface InfoAlertProps {
  variant?: AlertVariant;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  AlertVariant,
  {
    wrapper: string;
    iconColor: string;
    titleColor: string;
    descColor: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    wrapper: "border-sky-200 bg-sky-50/80",
    iconColor: "text-sky-600",
    titleColor: "text-sky-900",
    descColor: "text-sky-800",
    Icon: Info,
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50/80",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
    descColor: "text-emerald-800",
    Icon: CheckCircle2,
  },
  warning: {
    wrapper: "border-amber-300 bg-amber-50/90",
    iconColor: "text-amber-600",
    titleColor: "text-amber-900",
    descColor: "text-amber-800",
    Icon: AlertTriangle,
  },
  danger: {
    wrapper: "border-rose-300 bg-rose-50/95",
    iconColor: "text-rose-600",
    titleColor: "text-rose-950",
    descColor: "text-rose-900",
    Icon: ShieldAlert,
  },
};

export function InfoAlert({
  variant = "info",
  title,
  description,
  action,
  className = "",
}: InfoAlertProps) {
  const cfg = VARIANT_CONFIG[variant];
  const Icon = cfg.Icon;

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 ${cfg.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${cfg.titleColor}`}>{title}</h3>
          <p className={`mt-1 text-xs leading-relaxed sm:text-sm ${cfg.descColor}`}>
            {description}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}

