import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareCheck,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  GraduationCap
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function Sidebar() {
  const { currentRole, currentView, navigateTo, logout } = useApp();

  const studentNav = [
    { label: "Dashboard", view: "student-dashboard", icon: LayoutDashboard },
    { label: "Courses", view: "student-dashboard", icon: BookOpen },
    { label: "Feedback", view: "student-dashboard", icon: MessageSquareCheck },
    { label: "Settings", view: "profile", icon: Settings }
  ];

  const facultyNav = [
    { label: "Dashboard", view: "faculty-dashboard", icon: LayoutDashboard },
    { label: "Courses", view: "faculty-dashboard", icon: BookOpen },
    { label: "Feedback", view: "faculty-dashboard", icon: MessageSquareCheck },
    { label: "Analytics", view: "feedback-analysis", icon: BarChart3 },
    { label: "Settings", view: "profile", icon: Settings }
  ];

  const adminNav = [
    { label: "Dashboard", view: "admin-dashboard", icon: LayoutDashboard },
    { label: "Courses", view: "course-management", icon: BookOpen },
    { label: "Feedback", view: "feedback-form-management", icon: MessageSquareCheck },
    { label: "Analytics", view: "reports-analytics", icon: BarChart3 },
    { label: "User Management", view: "user-management", icon: Users },
    { label: "Settings", view: "profile", icon: Settings }
  ];

  let navItems = studentNav;
  if (currentRole === "Faculty") navItems = facultyNav;
  if (currentRole === "Administrator") navItems = adminNav;

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between min-h-[calc(100vh-5rem)] p-6">
      <div className="space-y-6">
        {/* App Logo & Sub-Brand */}
        <div className="flex items-center gap-3.5 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-lg font-bold text-slate-800 tracking-tight leading-none">
              EduFeedback
            </span>
            <span className="block text-xs font-semibold text-slate-400 mt-1">
              {currentRole === "Administrator" ? "Administrative Suite" : "Academic Portal"}
            </span>
          </div>
        </div>

        {/* Action Button: '+ New Evaluation' for Faculty / Admin */}
        {(currentRole === "Faculty" || currentRole === "Administrator") && (
          <div>
            <button
              onClick={() => {
                if (currentRole === "Administrator") {
                  navigateTo("feedback-form-management");
                } else {
                  navigateTo("feedback-analysis");
                }
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ New Evaluation</span>
            </button>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.label}
                onClick={() => navigateTo(item.view)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-bold shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Links: Help Center & Logout */}
      <div className="border-t border-slate-100 pt-6 space-y-1.5">
        <button
          onClick={() => alert("Student Feedback System Help Center: Documentation & support are available.")}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
        >
          <HelpCircle className="h-5 w-5 text-slate-400" />
          <span>Help Center</span>
        </button>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="h-5 w-5 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
