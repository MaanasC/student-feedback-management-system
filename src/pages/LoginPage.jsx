import React, { useState } from "react";
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { loginWithCredentials, loginAsRole } = useApp();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Student");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }
    setErrorMessage("");
    loginWithCredentials(usernameOrEmail, password, selectedRole);
  };

  const handleQuickDemoLogin = (role) => {
    loginAsRole(role);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Central Login Card */}
      <div className="w-full max-w-md sm:max-w-lg space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl">
          {/* Logo & Subtitle */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
              EduFeedback
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Secure feedback platform for students and faculty
            </p>
          </div>

          {/* Error Message banner */}
          {errorMessage && (
            <div className="mt-5 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            {/* Role Tab Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Portal Role
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {["Student", "Faculty", "Administrator"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      if (role === "Student") setUsernameOrEmail("maanas.chawan@university.edu");
                      if (role === "Faculty") setUsernameOrEmail("alan.turing@university.edu");
                      if (role === "Administrator") setUsernameOrEmail("eleanor.vance@university.edu");
                      setPassword("password123");
                    }}
                    className={`rounded-md py-1.5 text-xs font-medium transition ${
                      selectedRole === role
                        ? "bg-white text-blue-700 shadow-xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {role === "Administrator" ? "Admin" : role}
                  </button>
                ))}
              </div>
            </div>

            {/* Email / Username field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email or Username
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Password reset instructions will be sent to your institutional email.")}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition"
            >
              <span>Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Instant 1-Click Demo Login
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Student")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-center text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Faculty")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-center text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Administrator")}
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-center text-xs font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Help link */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Need help accessing your account?{" "}
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                alert("Contact University IT Helpdesk: helpdesk@university.edu or ext 4090.");
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              Contact IT Support
            </a>
          </div>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>AES-256 Encrypted Session • Compliant with FERPA & Institutional Guidelines</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
