import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";
import { Layers, ChevronDown } from "lucide-react";

export function AppLayout({ children }) {
  const { currentView, navigateTo } = useApp();
  const [showNavMenu, setShowNavMenu] = useState(false);

  // If on login view, render clean full-screen view without app chrome
  if (currentView === "login") {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  const allPagesList = [
    { id: "login", label: "1. Login Page", role: "Public" },
    { id: "student-dashboard", label: "2. Student Dashboard", role: "Student" },
    { id: "feedback-form", label: "3. Feedback Form Page", role: "Student" },
    { id: "feedback-confirmation", label: "4. Submission Confirmation", role: "Student" },
    { id: "faculty-dashboard", label: "5. Faculty Dashboard", role: "Faculty" },
    { id: "feedback-analysis", label: "6. Feedback Analysis Page", role: "Faculty" },
    { id: "admin-dashboard", label: "7. Admin Dashboard", role: "Admin" },
    { id: "user-management", label: "8. User Management Page", role: "Admin" },
    { id: "course-management", label: "9. Course Management Page", role: "Admin" },
    { id: "feedback-form-management", label: "10. Feedback Form Management", role: "Admin" },
    { id: "reports-analytics", label: "11. Reports & Analytics Page", role: "Admin" },
    { id: "profile", label: "12. Profile Page", role: "All Roles" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Demo Wireframe Selector Bar */}
      <div className="bg-slate-900 text-slate-200 px-6 py-2.5 text-xs sm:text-sm flex flex-wrap items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white tracking-wide">
            Student Feedback System
          </span>
          <span className="text-slate-400 hidden md:inline">
            | Experiment Demonstration & Full-Width Prototype
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNavMenu(!showNavMenu)}
            className="flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-slate-200 border border-slate-700 transition font-medium"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Switch View ({currentView})</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showNavMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 py-2 shadow-2xl z-50 max-h-[30rem] overflow-y-auto">
              <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                All 12 Wireframe Pages
              </div>
              {allPagesList.map((page) => (
                <button
                  key={page.id}
                  onClick={() => {
                    navigateTo(page.id);
                    setShowNavMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between transition ${
                    currentView === page.id
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>{page.label}</span>
                  <span className="text-xs opacity-60">[{page.role}]</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Header />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/70 p-6 md:p-8 lg:p-10">
          <div className="w-full max-w-[1720px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
