import React, { useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  MessageSquareCheck,
  TrendingUp,
  Download,
  AlertTriangle,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import StatCard from "../../components/common/StatCard";
import Card, { CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

export function AdminDashboard() {
  const { adminMetrics, navigateTo } = useApp();
  const [selectedSemester, setSelectedSemester] = useState("Fall Semester 2024");

  const monthlyPoints = [
    { month: "Sep", val: 3.9, y: 70 },
    { month: "Oct", val: 4.1, y: 55 },
    { month: "Nov", val: 4.5, y: 35 },
    { month: "Dec", val: 4.3, y: 45 },
    { month: "Jan", val: 4.7, y: 20 },
    { month: "Feb", val: 4.8, y: 15 }
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Institutional Dashboard
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Overview of academic performance, evaluations, and administrative metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          >
            <option>Fall Semester 2024</option>
            <option>Spring Semester 2024</option>
            <option>Fall Semester 2023</option>
          </select>

          <Button
            variant="secondary"
            size="lg"
            icon={Download}
            onClick={() => alert("Exporting comprehensive institution evaluation report (PDF)...")}
            className="rounded-xl font-bold py-2.5 px-5 shadow-xs"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="14,250"
          trend="+2.4%"
          icon={Users}
        />
        <StatCard
          title="Total Faculty"
          value="845"
          trend="+18 New"
          icon={GraduationCap}
        />
        <StatCard
          title="Total Courses"
          value="1,120"
          trend="+12 New"
          icon={BookOpen}
        />
        <StatCard
          title="Feedback Responses"
          value="38.4k"
          trend="+12%"
          icon={MessageSquareCheck}
        />
      </div>

      {/* Grid: Overall Feedback Rating Line Chart (left) & Recent Activity (right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Rating Trend Chart */}
        <Card className="lg:col-span-2 rounded-2xl p-7">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Overall Feedback Rating
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Institutional aggregate satisfaction score across months
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <TrendingUp className="h-4 w-4" /> 4.8 Current Peak
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="pt-8 pb-4">
            <div className="relative h-60 w-full">
              <svg viewBox="0 0 500 120" className="h-full w-full overflow-visible">
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="4" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4" />

                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 40 80 Q 120 60 200 40 T 360 30 T 460 15 L 460 115 L 40 115 Z"
                  fill="url(#blueGradient)"
                />
                <path
                  d="M 40 80 Q 120 60 200 40 T 360 30 T 460 15"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {monthlyPoints.map((pt, i) => {
                  const x = 40 + i * 84;
                  return (
                    <g key={pt.month} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={pt.y}
                        r="6"
                        className="fill-white stroke-blue-600 stroke-[3.5] transition-all group-hover:r-8"
                      />
                      <text
                        x={x}
                        y={pt.y - 12}
                        textAnchor="middle"
                        className="text-xs font-bold fill-slate-800"
                      >
                        {pt.val}
                      </text>
                      <text
                        x={x}
                        y="126"
                        textAnchor="middle"
                        className="text-xs font-bold fill-slate-400"
                      >
                        {pt.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </Card>

        {/* Right 1 Col: Recent Activity */}
        <Card className="flex flex-col justify-between rounded-2xl p-7">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
              <button
                onClick={() => alert("Showing full audit log")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-3 space-y-3">
              {adminMetrics.recentActivities.map((act) => (
                <div key={act.id} className="pt-3 pb-1 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5">
                    {act.iconType === "alert" ? (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    ) : act.iconType === "user" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs md:text-sm font-semibold text-slate-800 leading-snug">
                      {act.title}
                    </p>
                    <span className="text-[11px] text-slate-400 font-medium">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigateTo("reports-analytics")}
              className="w-full text-xs sm:text-sm font-bold py-2.5 rounded-xl"
            >
              Institutional Reports & Analytics
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Evaluation Campaigns Table */}
      <Card className="rounded-2xl overflow-hidden p-0">
        <div className="p-6 md:p-7 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Active Evaluation Campaigns
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Real-time feedback collection progress across university departments
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => navigateTo("feedback-form-management")}
            className="rounded-xl font-bold py-2.5 px-4 shadow-sm"
          >
            New Campaign
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-y border-slate-200">
              <tr>
                <th className="py-4 px-6">Campaign Name</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Progress</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {adminMetrics.activeCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {camp.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-semibold">
                    {camp.department}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-36 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${camp.progress}%` }}
                          className="h-full rounded-full bg-blue-600"
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {camp.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="active" size="md">{camp.status}</Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => navigateTo("reports-analytics")}
                      className="text-xs sm:text-sm font-bold text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
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

export default AdminDashboard;
