import React from "react";

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeType = "info",
  trend,
  className = ""
}) {
  const badgeStyles = {
    info: "text-blue-600 bg-blue-50 border-blue-200",
    warning: "text-amber-600 bg-amber-50 border-amber-200",
    danger: "text-rose-600 bg-rose-50 border-rose-200",
    success: "text-emerald-600 bg-emerald-50 border-emerald-200"
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-6 md:p-7 shadow-xs transition hover:border-slate-300 hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 shadow-xs">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        {trend && (
          <span className="text-xs md:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            {trend}
          </span>
        )}
      </div>

      {(subtext || badge) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
          {subtext && <span className="text-slate-500 font-medium">{subtext}</span>}
          {badge && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[badgeType] || badgeStyles.info}`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
