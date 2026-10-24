import React, { useState } from "react";
import {
  Download,
  Filter,
  ArrowLeft,
  ChevronRight,
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ThumbsUp,
  Sparkles
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card, { CardHeader } from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import StarRating from "../../components/common/StarRating";

export function FeedbackAnalysisPage() {
  const { selectedAnalysisCourse, navigateTo } = useApp();
  const [selectedTerm, setSelectedTerm] = useState("Fall 2023");
  const [selectedCycle, setSelectedCycle] = useState("Mid-Term Cycle");
  const [commentFilter, setCommentFilter] = useState("All");

  const data = selectedAnalysisCourse || {
    courseCode: "CS101",
    courseName: "Intro to Computer Science",
    facultyName: "Dr. Alan Turing",
    term: "Fall 2023",
    cycle: "Mid-Term Cycle",
    overallRating: 4.6,
    totalResponses: 142,
    responseRate: "85%",
    changeFromLastCycle: "+0.2"
  };

  const questionStats = [
    {
      id: "q1",
      title: "1. Explanation of complex concepts and algorithms",
      score: 4.7,
      breakdown: [
        { star: 5, pct: 68 },
        { star: 4, pct: 24 },
        { star: 3, pct: 6 },
        { star: 2, pct: 1 },
        { star: 1, pct: 1 }
      ]
    },
    {
      id: "q2",
      title: "2. Instructor responsiveness and subject knowledge",
      score: 4.8,
      breakdown: [
        { star: 5, pct: 75 },
        { star: 4, pct: 18 },
        { star: 3, pct: 5 },
        { star: 2, pct: 1 },
        { star: 1, pct: 1 }
      ]
    },
    {
      id: "q3",
      title: "3. Lecture organization, pacing, and syllabus schedule",
      score: 4.4,
      breakdown: [
        { star: 5, pct: 55 },
        { star: 4, pct: 30 },
        { star: 3, pct: 10 },
        { star: 2, pct: 3 },
        { star: 1, pct: 2 }
      ]
    },
    {
      id: "q4",
      title: "4. Assignment clarity and rubric guidance",
      score: 3.8,
      breakdown: [
        { star: 5, pct: 35 },
        { star: 4, pct: 30 },
        { star: 3, pct: 20 },
        { star: 2, pct: 10 },
        { star: 1, pct: 5 }
      ]
    }
  ];

  const studentComments = [
    {
      id: 1,
      author: "Student (Anonymous)",
      date: "2 days ago",
      text: "Dr. Turing's clear walkthrough of recursion and time complexity was the best explanation I've had. Lab hours were also super productive.",
      sentiment: "Positive",
      tag: "Teaching Quality"
    },
    {
      id: 2,
      author: "Student (Anonymous)",
      date: "3 days ago",
      text: "The programming assignments are challenging, but releasing problem specifications 2 days earlier would give us better runway to debug edge cases.",
      sentiment: "Constructive",
      tag: "Assignment Clarity"
    },
    {
      id: 3,
      author: "Student (Anonymous)",
      date: "5 days ago",
      text: "Very approachable during office hours. Always willing to whiteboard alternative solutions without rushing us.",
      sentiment: "Positive",
      tag: "Office Hours"
    },
    {
      id: 4,
      author: "Student (Anonymous)",
      date: "1 week ago",
      text: "Would appreciate more practice mock problems for the upcoming mid-term exams.",
      sentiment: "Constructive",
      tag: "Exams"
    }
  ];

  const filteredComments = studentComments.filter((c) => {
    if (commentFilter === "All") return true;
    return c.sentiment === commentFilter;
  });

  return (
    <div className="space-y-8 w-full">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-500 font-medium">
        <button
          onClick={() => navigateTo("faculty-dashboard")}
          className="hover:text-blue-600 transition"
        >
          Overview
        </button>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-bold text-slate-700">{data.courseCode}</span>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="text-blue-600 font-bold">Feedback Analysis</span>
      </nav>

      {/* Header and Filter Controls */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800">
            {data.courseCode}: {data.courseName}
          </h1>
          <p className="mt-2 text-sm md:text-base font-medium text-slate-500">
            Instructor: {data.facultyName} | {selectedTerm}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option>Fall 2023</option>
            <option>Spring 2024</option>
            <option>Fall 2024</option>
          </select>

          <select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option>Mid-Term Cycle</option>
            <option>End-Term Cycle</option>
          </select>

          <Button
            variant="secondary"
            size="lg"
            icon={Download}
            onClick={() => alert("Exporting Feedback Analysis as PDF report...")}
            className="rounded-xl font-bold py-2.5 px-5 shadow-xs"
          >
            Export
          </Button>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Rating */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
            Overall Rating
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">4.6</span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm text-emerald-600 font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>+0.2 from last cycle</span>
          </div>
        </div>

        {/* Total Responses */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate-500">
            Total Responses
          </span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900">142</span>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="font-bold text-blue-600">85%</span> response rate
          </div>
        </div>

        {/* Highest Rated */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-700">
            Highest Rated
          </span>
          <div className="mt-4 text-lg md:text-xl font-extrabold text-slate-800">
            Subject Knowledge
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600">
            <Star className="h-4 w-4 fill-emerald-500 text-emerald-500" />
            <span>4.8 / 5.0</span>
          </div>
        </div>

        {/* Area for Focus */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-7 shadow-xs">
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-amber-700">
            Area for Focus
          </span>
          <div className="mt-4 text-lg md:text-xl font-extrabold text-slate-800">
            Assignment Clarity
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>3.8 / 5.0</span>
          </div>
        </div>
      </div>

      {/* Question-wise Breakdown Section */}
      <Card className="rounded-2xl p-7">
        <CardHeader
          title="Question-Wise Rating Statistics"
          subtitle="Detailed student feedback distribution per parameter"
        />

        <div className="space-y-8 pt-3">
          {questionStats.map((q) => (
            <div key={q.id} className="space-y-3 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-800">{q.title}</h4>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <span>Score: {q.score}</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-2 pt-2">
                {q.breakdown.map((b) => (
                  <div key={b.star} className="flex items-center gap-4 text-xs sm:text-sm">
                    <span className="w-16 text-slate-500 font-semibold">
                      {b.star} Stars
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${b.pct}%` }}
                        className={`h-full rounded-full ${
                          b.star >= 4
                            ? "bg-blue-600"
                            : b.star === 3
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                    </div>
                    <span className="w-12 text-right font-bold text-slate-700">
                      {b.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Student Comments and Suggestions */}
      <Card className="rounded-2xl p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Student Comments & Qualitative Feedback
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Anonymized qualitative feedback submitted by enrolled students
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1.5">
            {["All", "Positive", "Constructive"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCommentFilter(tab)}
                className={`rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
                  commentFilter === tab
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredComments.map((cm) => (
            <div
              key={cm.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 space-y-3 hover:bg-slate-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800">
                    {cm.author}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• {cm.date}</span>
                </div>

                <Badge
                  variant={cm.sentiment === "Positive" ? "active" : "pending"}
                  size="md"
                >
                  {cm.tag}
                </Badge>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed italic">
                "{cm.text}"
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default FeedbackAnalysisPage;
