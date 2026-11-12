import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toast, dismissToast } = useApp() || {};

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    urgent: <Bell className="h-5 w-5 text-rose-500 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50/95 text-amber-900',
    info: 'border-blue-200 bg-blue-50/95 text-blue-900',
    urgent: 'border-rose-200 bg-rose-50/95 text-rose-900',
  };

  return (
    <aside aria-label="Alerts" className="fixed top-6 right-6 z-50 max-w-md w-full animate-bounce-in shadow-2xl rounded-2xl border backdrop-blur-md p-4 transition-all">
      <div className={`flex items-start gap-3 rounded-xl p-3 border ${borders[toast.type] || borders.info}`}>
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-sm font-semibold">
          <p>{toast.message}</p>
        </div>
        <button
          onClick={dismissToast}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export default Toast;
