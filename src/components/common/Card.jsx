import React from "react";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-xs transition-all ${
        hover ? "hover:border-slate-300 hover:shadow-sm" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between border-b border-slate-100 pb-5 mb-5 ${className}`}>
      <div>
        <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default Card;
