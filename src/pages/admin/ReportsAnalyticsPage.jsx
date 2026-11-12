import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Download,
  Star,
  CheckCircle,
  BookOpen,
  FileText,
  BarChart3,
  MessageSquare,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { api } from "../../services/api";

export function ReportsAnalyticsPage() {
  const { exportCSV } = useApp();

  const [semester, setSemester] = useState("All Semesters");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = {};
      if (deptFilter !== "All Departments") filters.department = deptFilter;
      if (semester !== "All Semesters") filters.semester = semester;

      const res = await api.getReports(filters);
      if (res && res.success) {
        setReportData(res);
      } else {
        setError(res?.message || "Failed to load reports from database.");
      }
    } catch {
      setError("Server connection failed while loading analytics data.");
    } finally {
      setIsLoading(false);
    }
  }, [deptFilter, semester]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const metrics = reportData?.metrics || {
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalForms: 0,
    publishedForms: 0,
    draftForms: 0,
    totalResponses: 0,
    institutionalAverageRating: 0,
    overallResponseRate: "0%",
  };

  const departmentPerformance = reportData?.departmentPerformance || [];
  const courseAnalytics = reportData?.courseAnalytics || [];
  const ratingDistribution = useMemo(() => {
    return reportData?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }, [reportData]);
  const submissionTrends = reportData?.submissionTrends || [];
  const recentComments = reportData?.recentComments || [];

  // Total rating counts across all ratings for distribution percentages
  const totalRatingEntries = useMemo(() => {
    return Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  }, [ratingDistribution]);

  const handleExportCSV = () => {
    if (!courseAnalytics || courseAnalytics.length === 0) {
      alert("No data available to export.");
      return;
    }

    const exportRows = courseAnalytics.map((c) => ({
      CourseCode: c.courseCode,
      CourseTitle: c.courseName,
      Department: c.department,
      Semester: c.semester,
      FacultyInstructor: c.facultyName,
      EnrolledStudents: c.enrolledCount,
      AssociatedForms: c.formsCount,
      TotalSubmissions: c.submissionsCount,
      AverageRating: c.averageRating > 0 ? c.averageRating : "N/A",
      ResponseRate: `${c.responseRate}%`,
    }));

    exportCSV(exportRows, `Institutional_Feedback_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-8 w-full">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Reports & Analytics
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Institutional performance analysis aggregated dynamically from MongoDB Atlas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={fetchReports}
            className="rounded-xl font-bold py-2.5 px-4 shadow-xs"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Download}
            onClick={handleExportCSV}
            className="rounded-xl font-bold py-2.5 px-5 shadow-xs"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Academic Term / Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Semesters</option>
              <option>Fall 2024</option>
              <option>Spring 2024</option>
              <option>Fall 2023</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">
              Academic Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>All Departments</option>
              <option>Computer Science</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Engineering</option>
              <option>Business</option>
              <option>Arts & Humanities</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-20 text-center text-sm font-semibold text-slate-500 flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span>Calculating live aggregation metrics from database...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold text-center">
          {error}
        </div>
      ) : (
        <>
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Institutional Rating
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {metrics.institutionalAverageRating > 0 ? metrics.institutionalAverageRating.toFixed(2) : "N/A"}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-3 text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                <span>Aggregated Score Across All Questions</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Submissions
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {metrics.totalResponses}
                </span>
                <span className="text-xs font-bold text-slate-400">responses</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 font-bold flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Verified Student Evaluations</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Response Rate
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {metrics.overallResponseRate}
                </span>
              </div>
              <div className="mt-3 text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>Active Campaign Participation</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Evaluations
              </span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-slate-900">
                  {metrics.publishedForms}
                </span>
                <span className="text-xs font-bold text-slate-400">of {metrics.totalForms} Forms</span>
              </div>
              <div className="mt-3 text-xs text-purple-600 font-bold flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{metrics.totalCourses} Academic Courses</span>
              </div>
            </div>
          </div>

          {/* Department Performance Bar Chart & Rating Distribution */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left: Department Performance */}
            <Card className="flex flex-col justify-between rounded-2xl p-7">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Department Satisfaction Ratings</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Average student rating across academic departments
                </p>
              </div>

              <div className="pt-8 pb-4">
                {departmentPerformance.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-400 font-medium">
                    No departmental data matching selected filters.
                  </div>
                ) : (
                  <div className="flex h-56 items-end justify-around gap-4 px-4 border-b border-slate-100">
                    {departmentPerformance.map((dept) => {
                      const score = dept.averageRating || 0;
                      const heightPercent = score > 0 ? Math.min(100, Math.max(15, Math.round((score / 5) * 100))) : 8;

                      return (
                        <div
                          key={dept.department}
                          className="group relative flex flex-1 flex-col items-center gap-2 h-full justify-end"
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white shadow-md pointer-events-none whitespace-nowrap z-10">
                            {score > 0 ? `${score} / 5.0 (${dept.responseCount} resp)` : "No ratings"}
                          </div>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[54px] rounded-t-xl transition-all ${
                              score >= 4.5
                                ? "bg-emerald-500 group-hover:bg-emerald-600"
                                : score >= 3.5
                                ? "bg-blue-600 group-hover:bg-blue-700"
                                : "bg-slate-300 group-hover:bg-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-700 mt-1 truncate max-w-[80px] text-center" title={dept.department}>
                            {dept.department.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 pt-3 px-4">
                  <span>0.0</span>
                  <span>2.5</span>
                  <span>5.0 Stars</span>
                </div>
              </div>
            </Card>

            {/* Right: Rating Distribution Breakdown */}
            <Card className="flex flex-col justify-between rounded-2xl p-7">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span>Rating Breakdown Distribution</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Distribution of student ratings across all evaluated criteria
                </p>
              </div>

              <div className="py-6 space-y-3.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars] || 0;
                  const pct = totalRatingEntries > 0 ? Math.round((count / totalRatingEntries) * 100) : 0;

                  return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                      <span className="w-14 font-bold text-slate-700 flex items-center gap-1">
                        <span>{stars}</span>
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      </span>

                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            stars === 5
                              ? "bg-emerald-500"
                              : stars === 4
                              ? "bg-blue-500"
                              : stars === 3
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                      </div>

                      <span className="w-12 text-right text-xs font-bold text-slate-600">
                        {pct}%
                      </span>
                      <span className="w-14 text-right text-xs text-slate-400">
                        ({count})
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Answer Ratings Sampled: <strong className="text-slate-800">{totalRatingEntries}</strong></span>
                <span>Verified in MongoDB</span>
              </div>
            </Card>
          </div>

          {/* Submission Trends Timeline */}
          {submissionTrends.length > 0 && (
            <Card className="p-7 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Submission Trajectory Over Time</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Temporal distribution of student feedback submissions
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  {submissionTrends.length} Active Periods
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                {submissionTrends.map((trend) => (
                  <div key={trend.date} className="flex-1 min-w-[130px] p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{trend.date}</div>
                    <div className="text-2xl font-black text-slate-800 mt-1">
                      {trend.count} <span className="text-xs font-normal text-slate-400">submissions</span>
                    </div>
                    {trend.averageScore > 0 && (
                      <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                        <span>{trend.averageScore.toFixed(1)} Avg Score</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Course-Wise Analytics Table */}
          <Card className="p-0 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Course-Wise Performance & Response Rates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed breakdown of feedback metrics for each registered course
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {courseAnalytics.length} Academic Courses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-xs border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-6">Course</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Instructor</th>
                    <th className="py-4 px-5 text-center">Forms</th>
                    <th className="py-4 px-5 text-center">Submissions</th>
                    <th className="py-4 px-5 text-center">Avg Rating</th>
                    <th className="py-4 px-6 text-right">Response Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courseAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No courses recorded in the database matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    courseAnalytics.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-6">
                          <span className="font-extrabold text-blue-700 font-mono text-xs">
                            {c.courseCode}
                          </span>
                          <span className="block font-bold text-slate-800 text-sm mt-0.5">
                            {c.courseName}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-600 text-xs">
                          {c.department}
                        </td>
                        <td className="py-4 px-5 text-slate-700 font-semibold text-xs">
                          {c.facultyName}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.formsCount}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="font-bold text-slate-800">
                            {c.submissionsCount}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-1">
                            / {c.enrolledCount}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          {c.averageRating > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-xs">
                              <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                              <span>{c.averageRating.toFixed(1)}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No ratings</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, c.responseRate)}%` }}
                                className="h-full bg-blue-600 rounded-full"
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700 w-10 text-right">
                              {c.responseRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Real Qualitative Student Comments */}
          {recentComments.length > 0 && (
            <Card className="p-7 rounded-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <span>Recent Qualitative Student Feedback</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentic comments submitted by students in course evaluation forms
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Showing {recentComments.length} latest entries
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-xs transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-700 font-mono">
                        {comment.courseCode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {comment.submittedAt ? new Date(comment.submittedAt).toLocaleDateString() : "Recent"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic">
                      "{comment.comments}"
                    </p>
                    {comment.suggestions && (
                      <p className="text-[11px] text-slate-500">
                        <strong className="text-slate-600">Suggestion:</strong> {comment.suggestions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default ReportsAnalyticsPage;
