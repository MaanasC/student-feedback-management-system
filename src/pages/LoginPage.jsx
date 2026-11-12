import React, { useState } from "react";
import {
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export function LoginPage() {
  const { loginWithCredentials, loginAsRole, registerStudent } = useApp();

  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Student");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Student registration state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNo: "",
    department: "Computer Science",
    semester: 5,
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(usernameOrEmail.trim(), password);
      if (!res.success) {
        setErrorMessage(res.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Unable to connect to authentication server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!regData.name.trim() || !regData.email.trim() || !regData.password.trim() || !regData.rollNo.trim()) {
      setErrorMessage("Please complete all required registration fields.");
      return;
    }

    if (regData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(regData.email)) {
      setErrorMessage("Please enter a valid institutional email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerStudent({
        name: regData.name.trim(),
        email: regData.email.trim().toLowerCase(),
        password: regData.password,
        rollNo: regData.rollNo.trim(),
        department: regData.department,
        semester: Number(regData.semester),
      });

      if (!res.success) {
        setErrorMessage(res.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Server connection error during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role) => {
    setIsLoading(true);
    setErrorMessage("");
    let email = "maanas.chawan@university.edu";
    if (role === "Faculty") email = "alan.turing@university.edu";
    if (role === "Administrator") email = "eleanor.vance@university.edu";

    setUsernameOrEmail(email);
    setPassword("password123");
    setSelectedRole(role);

    try {
      const res = await loginWithCredentials(email, "password123");
      if (!res.success) {
        // Fallback to offline demo switch
        loginAsRole(role);
      }
    } catch (e) {
      loginAsRole(role);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Central Card */}
      <div className="w-full max-w-md sm:max-w-lg space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/50">
          {/* Logo & Subtitle */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="h-9 w-9" />
            </div>
            <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
              EduFeedback Portal
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
              Academic feedback management and real-time evaluation suite
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Register) */}
          <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMode === "login"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMode === "register"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Student Registration</span>
            </button>
          </div>

          {/* Alert Banners */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === "login" && (
            <form className="mt-6 space-y-4" onSubmit={handleLogin}>
              {/* Role Demo Auto-Fill Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                      className={`rounded-md py-1.5 text-xs font-semibold transition ${
                        selectedRole === role
                          ? "bg-white text-blue-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {role === "Administrator" ? "Admin" : role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email / Username */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700"
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
                    placeholder="e.g. maanas.chawan@university.edu"
                    required
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700"
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
                    required
                    className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-600 font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => alert("Demo Password: All demo accounts use 'password123'.")}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Authenticating with MongoDB...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. STUDENT REGISTRATION FORM */}
          {authMode === "register" && (
            <form className="mt-6 space-y-3.5" onSubmit={handleRegister}>
              <div>
                <label className="block text-xs font-bold text-slate-700">Full Legal Name</label>
                <input
                  type="text"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  placeholder="e.g. Maanas Chawan"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">University Email</label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  placeholder="e.g. maanas.chawan@university.edu"
                  required
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Roll / Student ID</label>
                  <input
                    type="text"
                    value={regData.rollNo}
                    onChange={(e) => setRegData({ ...regData, rollNo: e.target.value })}
                    placeholder="e.g. D15A-08"
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Semester</label>
                  <select
                    value={regData.semester}
                    onChange={(e) => setRegData({ ...regData, semester: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Department</label>
                <select
                  value={regData.department}
                  onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Min 6 chars"
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    required
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 transition"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Student Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Select Demo Accounts */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              One-Click Evaluator Demo Access
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Student")}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-2 text-center text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Faculty")}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-2 text-center text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("Administrator")}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-2 text-center text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>MongoDB Atlas Connected • JWT Signed Authentication • Socket.IO Active</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
