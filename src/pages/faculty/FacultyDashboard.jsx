import React from "react";
import {
  Download,
  BookOpen,
  Star,
  Users,
  CheckCircle,
  TrendingUp,
  BarChart2,
  ArrowRight
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import StatCard from "../../components/common/StatCard";
import Card, { CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import StarRating from "../../components/common/StarRating";

export function FacultyDashboard() {
  const { navigateTo } = useApp();

  const facultyCourses = [
    {
      code: "CS 401",
      name: "Advanced Software Engineering",
      status: "Active",
      enrolled: 45,
      responses: 38,
      rating: 4.8
    },
    {
      code: "CS 220",
      name: "Data Structures & Algorithms",
      status: "Active",
      enrolled: 120,
      responses: 86,
      rating: 4.5
    },
    {
      code: "CS 550",
      name: "Machine Learning Ethics",
      status: "Pending",
      enrolled: 30,
      responses: 0,
      rating: null
    }
  ];

  const ratingTrends = [
    { label: "W1", value: 4.2, height: "70%" },
    { label: "W2", value: 4.4, height: "78%" },
    { label: "W3", value: 4.7, height: "92%" },
    { label: "W4", value: 4.6, height: "88%" }
  ];

  const handleExport = () => {
    alert("Generating Faculty Evaluation Summary Report (PDF)... Download starting.");
  };

  const handleViewAnalytics = (course) => {
    navigateTo("feedback-analysis", {
      courseCode: course.code,
      courseName: course.name,
      facultyName: "Dr. Alan Turing",
      overallRating: course.rating || 4.6,
      totalResponses: course.responses || 124
    });
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header bar with Export Report */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Faculty Dashboard
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Fall Semester 2024 Overview • Department of Computer Science
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          icon={Download}
          onClick={handleExport}
          className="rounded-xl font-bold py-3 px-6 shadow-xs"
        >
          Export Report
        </Button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard
          title="Courses Taught"
          value="3"
          subtext="Fall 2024 term"
          icon={BookOpen}
        />
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 md:p-7 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-slate-500">
              Average Rating
            </span>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 border border-amber-100 shadow-xs">
              <Star className="h-6 w-6 fill-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">4.6</span>
            <span className="text-sm text-slate-400 font-bold">/ 5.0</span>
          </div>
          <div className="mt-4">
            <StarRating rating={4.6} size="md" />
          </div>
        </div>

        <StatCard
          title="Total Responses"
          value="124"
          subtext="Across all courses"
          icon={Users}
        />
        <StatCard
          title="Completion Rate"
          value="88%"
          subtext="High student engagement"
          icon={CheckCircle}
          trend="+5%"
        />
      </div>

      {/* Main Grid: My Courses list (left 2 cols) & Rating Trend (right 1 col) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left: My Courses */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">My Courses</h2>

          <div className="space-y-4">
            {facultyCourses.map((c) => (
              <div
                key={c.code}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 md:p-7 shadow-xs transition hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-center"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-blue-700">
                      {c.code}
                    </span>
                    <Badge variant={c.status.toLowerCase()} size="md">{c.status}</Badge>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-slate-800">
                    {c.name}
                  </h3>

                  <p className="text-sm font-medium text-slate-500">
                    {c.enrolled} Enrolled • {c.responses} Student Responses
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Avg Rating
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xl font-black text-slate-800">
                        {c.rating ? `${c.rating}` : "N/A"}
                      </span>
                      {c.rating && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleViewAnalytics(c)}
                    className="rounded-xl px-5 py-2.5 font-bold"
                  >
                    View Analytics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Rating Trend Widget */}
        <div className="space-y-5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Rating Trend</h2>

          <Card className="flex flex-col justify-between h-[360px] rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Student Satisfaction
              </h3>
              <p className="mt-1.5 text-xs md:text-sm text-slate-600 leading-relaxed">
                Aggregate student satisfaction over the last 4 weeks across all active courses
              </p>
            </div>

            {/* Visual Bar Chart */}
            <div className="flex h-52 items-end justify-between gap-4 px-4 pt-6 pb-2 border-b border-slate-100">
              {ratingTrends.map((bar) => (
                <div
                  key={bar.label}
                  className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white shadow-md">
                    {bar.value}
                  </div>
                  <div
                    style={{ height: bar.height }}
                    className="w-full max-w-[50px] rounded-t-lg bg-blue-600 transition-all group-hover:bg-blue-700"
                  />
                  <span className="text-xs md:text-sm font-bold text-slate-600">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-slate-500 pt-3">
              <span className="flex items-center gap-2 font-medium">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                Weekly Score
              </span>
              <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> +9.5% Overall
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
