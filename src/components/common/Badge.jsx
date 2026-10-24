import React from "react";

export function Badge({ children, variant = "default", size = "md", className = "" }) {
  const variantStyles = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    draft: "bg-slate-100 text-slate-700 border-slate-300",
    inactive: "bg-rose-50 text-rose-700 border-rose-200",
    role: "bg-indigo-50 text-indigo-700 border-indigo-200",
    default: "bg-slate-50 text-slate-600 border-slate-200"
  };

  const normalizedVariant = (variant || "default").toLowerCase();
  const selectedStyle = variantStyles[normalizedVariant] || variantStyles.default;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${selectedStyle} ${sizeStyles[size]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
      {children}
    </span>
  );
}

export default Badge;
