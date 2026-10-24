import React, { useState } from "react";
import {
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Star,
  Users,
  CheckCircle,
  FileSpreadsheet,
  Award,
  Layers
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card, { CardHeader } from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";
import Button from "../../components/common/Button";
import StarRating from "../../components/common/StarRating";

export function ReportsAnalyticsPage() {
  const { adminMetrics } = useApp();

  const [academicYear, setAcademicYear] = useState("2023 - 2024");
  const [semester, setSemester] = useState("Fall Semester (All)");
  const [deptFilter, setDeptFilter] = useState("All Departments");

  const deptBars = [
    { code: "CS", name: "Computer Science", score: 4.6, height: "92%" },
    { code: "ENG", name: "Engineering", score: 4.4, height: "88%" },
    { code: "BUS", name: "Business", score: 4.2, height: "84%" },
    { code: "ART", name: "Arts & Hum.", score: 4.0, height: "80%" },
    { code: "SCI", name: "Sciences", score: 4.5, height: "90%" }
  ];

  const trendWeeks = [
    { week: "Week 1", score: 3.8, x: 50, y: 80 },
    { week: "Week 4", score: 4.0, x: 150, y: 65 },
    { week: "Week 8", score: 4.2, x: 250, y: 50 },
    { week: "Week 12", score: 4.3, x: 350, y: 40 },
    { week: "Finals", score: 4.6, x: 450, y: 20 }
  ];

  const facultyRankings = [
    { rank: 1, name: "Dr. Richard Feynman", dept: "Physics", rating: 4.9, responses: 58 },
    { rank: 2, name: "Prof. Grace Hopper", dept: "Computer Science", rating: 4.8, responses: 110 },
    { rank: 3, name: "Dr. Alan Turing", dept: "Computer Science", rating: 4.6, responses: 324 },
    { rank: 4, name: "Prof. Emmy Noether", dept: "Mathematics", rating: 4.4, responses: 110 },
    { rank: 5, name: "Prof. Alan Smith", dept: "Arts & Humanities", rating: 4.3, responses: 65 }
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Comprehensive overview of institutional feedback and academic performance metrics
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          icon={Download}
          onClick={() => alert("Generating Institutional Analytics Dossier (PDF/CSV)...")}
          className="rounded-xl font-bold py-2.5 px-5 shadow-xs"
        >
          Export Report
        </Button>
      </div>

      {/* Filter Row */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Academic Year
            </label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>2023 - 2024</option>
              <option>2024 - 2025</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Fall Semester (All)</option>
              <option>Spring Semester (All)</option>
            </select>
          </div>

          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Engineering</option>
              <option>Business</option>
              <option>Arts & Humanities</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
            Overall Rating
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">4.4</span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-3 text-xs md:text-sm text-emerald-600 font-bold flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> +0.2 from last semester
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
            Total Responses
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">42,850</span>
          </div>
          <div className="mt-3 text-xs md:text-sm text-slate-500 font-medium">
            <span className="font-bold text-blue-600">+12%</span> participation rate
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
            Completion Rate
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">82%</span>
          </div>
          <div className="mt-3 text-xs md:text-sm text-emerald-600 font-bold flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" /> Institutional Target Met (&gt;80%)
          </div>
        </div>
      </div>

      {/* Dual Charts: Department Performance & Feedback Trend */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Department Performance Bar Chart */}
        <Card className="flex flex-col justify-between rounded-2xl p-7">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Department Performance
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Average feedback rating comparison across 5 major faculties
            </p>
          </div>

          <div className="pt-10 pb-4">
            <div className="flex h-64 items-end justify-between gap-5 px-6 border-b border-slate-100">
              {deptBars.map((dept) => (
                <div
                  key={dept.code}
                  className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white shadow-md">
                    {dept.score}
                  </div>
                  <div
                    style={{ height: dept.height }}
                    className="w-full max-w-[56px] rounded-t-xl bg-blue-600 transition-all group-hover:bg-blue-700"
                  />
                  <span className="text-xs md:text-sm font-bold text-slate-700 mt-1">
                    {dept.code}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pt-3 px-6">
              <span>0.0</span>
              <span>2.5</span>
              <span>5.0 Max</span>
            </div>
          </div>
        </Card>

        {/* Right: Feedback Trend (Overall) Line Chart */}
        <Card className="flex flex-col justify-between rounded-2xl p-7">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Feedback Trend (Overall)
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Evaluation trajectory from Week 1 through Finals
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              Institution Avg
            </span>
          </div>

          <div className="pt-10 pb-4">
            <div className="relative h-64 w-full">
              <svg viewBox="0 0 500 130" className="h-full w-full overflow-visible">
                <line x1="20" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeDasharray="3" />
                <line x1="20" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeDasharray="3" />
                <line x1="20" y1="110" x2="480" y2="110" stroke="#f1f5f9" strokeDasharray="3" />

                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 50 80 C 150 70, 250 50, 350 40 S 450 20, 450 20 L 450 115 L 50 115 Z"
                  fill="url(#trendGradient)"
                />

                <path
                  d="M 50 80 C 150 70, 250 50, 350 40 S 450 20, 450 20"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {trendWeeks.map((tw) => (
                  <g key={tw.week} className="group cursor-pointer">
                    <circle
                      cx={tw.x}
                      cy={tw.y}
                      r="5.5"
                      className="fill-white stroke-blue-600 stroke-[3.5] hover:r-7 transition-all"
                    />
                    <text
                      x={tw.x}
                      y={tw.y - 12}
                      textAnchor="middle"
                      className="text-xs font-bold fill-slate-800"
                    >
                      {tw.score}
                    </text>
                    <text
                      x={tw.x}
                      y="126"
                      textAnchor="middle"
                      className="text-xs font-bold fill-slate-400"
                    >
                      {tw.week}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Faculty Feedback Rankings Table */}
      <Card className="rounded-2xl overflow-hidden p-0">
        <div className="p-6 md:p-7 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">
            Top Rated Faculty Members
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Highest student satisfaction rankings this academic cycle
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-y border-slate-200">
              <tr>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Faculty Member</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Average Rating</th>
                <th className="py-4 px-6 text-right">Student Responses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {facultyRankings.map((f) => (
                <tr key={f.rank} className="hover:bg-slate-50 transition">
                  <td className="py-4 px-6">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      #{f.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {f.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">
                    {f.dept}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <span>{f.rating}</span>
                      <StarRating rating={f.rating} size="sm" />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right text-slate-600 font-semibold">
                    {f.responses}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default ReportsAnalyticsPage;
