import React, { useState } from "react";
import { Search, Bell, Settings, User, LogOut, CheckCircle, ChevronDown, GraduationCap, Shield } from "lucide-react";
import { useApp } from "../../context/AppContext";

export function Header() {
  const {
    currentUser,
    currentRole = "Student",
    loginAsRole,
    logout,
    navigateTo,
    globalSearch = "",
    setGlobalSearch,
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    openSubmissionReview,
  } = useApp() || {};

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-6 md:px-10 shadow-xs">
      {/* Left: Search input */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch && setGlobalSearch(e.target.value)}
            placeholder="Search courses, faculty, feedback..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
      </div>

      {/* Right controls: Role Pill, Notifications, Settings, User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Demo Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="hidden sm:flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
            title="Active Portal Role"
          >
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Role: {currentRole}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl z-50">
              <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Portal Role
              </div>
              <button
                onClick={() => {
                  loginAsRole && loginAsRole("Student");
                  setShowRoleMenu(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between ${
                  currentRole === "Student" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Student View</span>
                {currentRole === "Student" && <CheckCircle className="h-4 w-4 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  loginAsRole && loginAsRole("Faculty");
                  setShowRoleMenu(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between ${
                  currentRole === "Faculty" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Faculty View</span>
                {currentRole === "Faculty" && <CheckCircle className="h-4 w-4 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  loginAsRole && loginAsRole("Administrator");
                  setShowRoleMenu(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium flex items-center justify-between ${
                  currentRole === "Administrator" ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>Administrator View</span>
                {currentRole === "Administrator" && <CheckCircle className="h-4 w-4 text-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead && markAllNotificationsRead()}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id || n._id}
                      onClick={() => {
                        if (markNotificationRead) markNotificationRead(n.id || n._id);
                        if (
                          (n.relatedResponseId || n.title?.includes("Feedback Submitted") || n.title?.includes("Submission")) &&
                          openSubmissionReview
                        ) {
                          openSubmissionReview(n.relatedResponseId || n.relatedFormId);
                        } else if (n.relatedFormId && currentRole === "Student") {
                          navigateTo("student-dashboard");
                        } else if (currentRole === "Administrator") {
                          navigateTo("feedback-form-management");
                        }
                        setShowNotifications(false);
                      }}
                      className={`py-2.5 px-2.5 rounded-xl transition cursor-pointer flex items-start gap-2.5 ${
                        !n.read ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                          !n.read ? "bg-blue-600" : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Quick Link */}
        <button
          onClick={() => navigateTo && navigateTo("profile")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          title="Account Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-slate-100 transition"
          >
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt={currentUser?.name || "User"}
              className="h-10 w-10 rounded-full border border-slate-200 object-cover shadow-xs"
            />
            <div className="hidden text-left md:block">
              <div className="text-sm font-bold text-slate-800 leading-snug">
                {currentUser?.name || "Maanas Chawan"}
              </div>
              <div className="text-xs text-slate-500 capitalize">{currentRole}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white py-2.5 shadow-xl z-50">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1.5">
                  <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">
                    {currentRole}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  navigateTo && navigateTo("profile");
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="h-4 w-4 text-slate-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  logout && logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition border-t border-slate-100 font-medium"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
