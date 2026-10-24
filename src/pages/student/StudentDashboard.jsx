import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  User,
  Search,
  Filter,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

export function StudentDashboard() {
  const {
    currentUser,
    pendingForms = [],
    studentSubmissions = [],
    navigateTo,
    feedbackForms = [],
    resetDemoState
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Pending' | 'Completed'
  const [filterStats, setFilterStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    setFilterStats({
      total: pendingForms.length + studentSubmissions.length,
      pending: pendingForms.length,
      completed: studentSubmissions.length
    });
  }, [pendingForms, studentSubmissions]);

  const handleStartFeedback = (pendingItem) => {
    const form =
      feedbackForms.find((f) => f.courseCode === pendingItem.courseCode) || {
        formId: pendingItem.formId,
        courseCode: pendingItem.courseCode,
        courseName: pendingItem.courseName,
        facultyName: pendingItem.facultyName,
        questionsCount: 4,
        questions: [
          {
            questionId: "q_1",
            questionText: "How clearly did the instructor explain complex concepts?",
            questionType: "Rating",
            required: true
          },
          {
            questionId: "q_2",
            questionText: "Rate the instructor's subject knowledge and responsiveness to questions.",
            questionType: "Rating",
            required: true
          },
          {
            questionId: "q_3",
            questionText: "How well organized and paced were the classroom lectures and syllabus?",
            questionType: "Rating",
            required: true
          },
          {
            questionId: "q_4",
            questionText: "Rate the fairness and transparency of grading and assessment criteria.",
            questionType: "Rating",
            required: true
          }
        ]
      };

    navigateTo("feedback-form", form);
  };

  const filteredPending = pendingForms.filter((item) => {
    const matchesSearch =
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facultyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || statusFilter === "Pending";
    return matchesSearch && matchesStatus;
  });

  const filteredSubmissions = studentSubmissions.filter((item) => {
    const matchesSearch =
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.facultyName && item.facultyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "All" || statusFilter === "Completed";
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 w-full">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            Welcome back, {currentUser?.name?.split(" ")[0] || "Maanas"}
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Student Feedback & Evaluation Portal • Academic Year 2024-2025
          </p>
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={resetDemoState}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
          title="Reset pending feedback items to demonstrate submission flow again"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Demo Submissions</span>
        </button>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Total Courses"
          value={filterStats.total.toString()}
          subtext="Enrolled this semester"
          icon={BookOpen}
        />
        <StatCard
          title="Pending Feedback"
          value={pendingForms.length.toString()}
          subtext="Action needed before deadline"
          icon={Clock}
          badge={pendingForms.length > 0 ? "Requires action" : "All completed"}
          badgeType={pendingForms.length > 0 ? "danger" : "success"}
        />
        <StatCard
          title="Completed Feedback"
          value={studentSubmissions.length.toString()}
          subtext="Total submissions recorded"
          icon={CheckCircle2}
          badge="Verified"
          badgeType="success"
        />
      </div>

      {/* Search & Category Filter Section */}
      <Card className="p-5 md:p-6 rounded-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input with event handling */}
          <div className="relative flex-1 md:max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code, name, or faculty instructor..."
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1.5 self-start md:self-auto">
            {["All", "Pending", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  statusFilter === tab
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
                {tab === "Pending" && pendingForms.length > 0 && (
                  <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 font-bold">
                    {pendingForms.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Grid: Pending Action Required & Recent Submissions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Action Required (Pending Feedback Forms) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                Action Required ({filteredPending.length})
              </h2>
              {filteredPending.length > 0 && (
                <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                  Pending Submission
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-slate-400">Current Semester</span>
          </div>

          {/* Conditional Rendering */}
          {statusFilter === "Completed" ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-sm font-medium text-slate-500">
              Filtering by 'Completed'. Switch to 'All' or 'Pending' to view required submissions.
            </div>
          ) : filteredPending.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-14 text-center rounded-2xl">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">
                {searchQuery ? "No matching pending forms" : "All Pending Feedback Completed!"}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mt-1.5">
                {searchQuery
                  ? "Try adjusting your search keywords."
                  : "You have completed all mandatory course evaluations. Thank you for participating!"}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPending.map((item) => (
                <div
                  key={item.courseCode}
                  className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-6 md:p-7 shadow-xs transition hover:border-blue-300 hover:shadow-sm sm:flex-row sm:items-center"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-blue-700 text-sm md:text-base">
                        {item.courseCode}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          item.badgeColor === "rose"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.dueNote}
                      </span>
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-slate-800">
                      {item.courseName}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <User className="h-4 w-4" />
                      <span>{item.facultyName}</span>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => handleStartFeedback(item)}
                      className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-xl"
                    >
                      <span>Give Feedback</span>
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Instructions Callout */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 md:p-6">
            <h4 className="text-sm font-bold text-blue-900">
              Interactive State Demonstration Note:
            </h4>
            <p className="mt-1.5 text-xs md:text-sm leading-relaxed text-blue-700">
              Clicking <strong>Give Feedback</strong> opens the rating form. Once submitted, React state automatically transfers the course from <em>Action Required</em> to <em>Recent Submissions</em>, updates all counter cards via Context API, and preserves state in localStorage.
            </p>
          </div>
        </div>

        {/* Right Col: Recent Submissions */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">
              Submissions ({filteredSubmissions.length})
            </h2>
            <Badge variant="completed" size="md">Completed</Badge>
          </div>

          {statusFilter === "Pending" ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-sm font-medium text-slate-500">
              Filtering by 'Pending'. Switch to 'All' or 'Completed' to view past submissions.
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <Card className="py-12 text-center text-sm text-slate-400 rounded-2xl">
              No submissions found for the current query.
            </Card>
          ) : (
            <Card className="divide-y divide-slate-100 p-0 rounded-2xl overflow-hidden">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {sub.courseName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.facultyName ? `${sub.facultyName} • ` : ""}
                        {sub.submittedDate}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {sub.courseCode}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {/* Anonymity Notice */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>FERPA & Anonymity Protected</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All ratings and comment submissions are stripped of student identifiers before generating faculty analytical reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
