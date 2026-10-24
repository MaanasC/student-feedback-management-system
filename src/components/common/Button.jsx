import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  disabled = false,
  onClick,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm focus:ring-blue-500",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus:ring-slate-400",
    dark: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus:ring-slate-600",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500",
    danger:
      "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 active:bg-rose-200 focus:ring-rose-400",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300",
    link: "bg-transparent text-blue-600 hover:underline p-0 focus:ring-0 shadow-none"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  );
}

export default Button;
